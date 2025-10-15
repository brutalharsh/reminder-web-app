const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  // MongoDB Enterprise connection options
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds socket timeout
  maxPoolSize: 10, // Connection pool size
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority',
  // For Enterprise clusters with replica sets
  readPreference: 'primary',
  readConcern: { level: 'majority' }
})
.then(() => console.log('Connected to MongoDB Enterprise'))
.catch(err => console.error('MongoDB connection error:', err));

// Discord Webhook URLs from environment
const DISCORD_WEBHOOKS = {
  REMINDER: process.env.DISCORD_WEBHOOK_REMINDER,
  COMPLETE: process.env.DISCORD_WEBHOOK_COMPLETE,
  DELETE: process.env.DISCORD_WEBHOOK_DELETE
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isSpecial: {
    type: Boolean,
    default: false
  },
  isDeletable: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'deleted'],
    default: 'active'
  },
  repeatInterval: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  lastNotified: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Task = mongoose.model('Task', taskSchema);

async function initializeSpecialCategories() {
  try {
    const completedCategory = await Category.findOne({ name: 'Completed Tasks' });
    if (!completedCategory) {
      await Category.create({
        name: 'Completed Tasks',
        isSpecial: true,
        isDeletable: false
      });
      console.log('Created Completed Tasks category');
    }

    const deletedCategory = await Category.findOne({ name: 'Deleted Tasks' });
    if (!deletedCategory) {
      await Category.create({
        name: 'Deleted Tasks',
        isSpecial: true,
        isDeletable: false
      });
      console.log('Created Deleted Tasks category');
    }
  } catch (err) {
    console.error('Error initializing special categories:', err);
  }
}

initializeSpecialCategories();

async function sendDiscordNotification(task, user, type = 'reminder') {
  try {
    const priorityColors = {
      'Easy': 0x00ff00,
      'Medium': 0xffff00,
      'Hard': 0xff0000
    };

    const titles = {
      'reminder': '📋 Task Reminder',
      'complete': '✅ Task Completed',
      'delete': '🗑️ Task Deleted',
      'permanent': '⚠️ Task Permanently Deleted',
      'created': '🆕 New Task Created'
    };

    const descriptions = {
      'reminder': `Hey <@${user.discordId}>, you have a task due!`,
      'complete': `<@${user.discordId}> has completed a task!`,
      'delete': `<@${user.discordId}>'s task has been moved to trash.`,
      'permanent': `<@${user.discordId}>'s task has been permanently deleted.`,
      'created': `A new task has been assigned to <@${user.discordId}>!`
    };

    const embed = {
      title: titles[type] || titles['reminder'],
      description: descriptions[type] || descriptions['reminder'],
      color: type === 'complete' ? 0x00ff00 : type === 'delete' || type === 'permanent' ? 0xff0000 : type === 'created' ? 0x3498db : priorityColors[task.priority],
      fields: [
        {
          name: 'Task',
          value: task.taskName,
          inline: false
        },
        {
          name: 'Due Date',
          value: new Date(task.dueDate).toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          inline: true
        },
        {
          name: 'Priority',
          value: task.priority,
          inline: true
        },
        {
          name: 'Category',
          value: task.category.name,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    // Choose webhook based on type
    let webhookUrl = DISCORD_WEBHOOKS.REMINDER;
    if (type === 'complete') {
      webhookUrl = DISCORD_WEBHOOKS.COMPLETE;
    } else if (type === 'delete' || type === 'permanent') {
      webhookUrl = DISCORD_WEBHOOKS.DELETE;
    } else if (type === 'created' || type === 'reminder') {
      webhookUrl = DISCORD_WEBHOOKS.REMINDER;
    }

    await axios.post(webhookUrl, {
      content: `<@${user.discordId}>`,
      embeds: [embed]
    });

    // Only update lastNotified for reminder type
    if (type === 'reminder') {
      await Task.findByIdAndUpdate(task._id, { lastNotified: new Date() });
    }

    console.log(`${type} notification sent for task: ${task.taskName}`);
  } catch (error) {
    console.error(`Error sending Discord ${type} notification:`, error);
  }
}

async function checkAndSendNotifications() {
  try {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    const tasks = await Task.find({
      status: 'active'
    }).populate('assignedUser').populate('category');

    for (const task of tasks) {
      const shouldNotify = await shouldSendNotification(task, istNow);
      if (shouldNotify) {
        await sendDiscordNotification(task, task.assignedUser, 'reminder');
      }
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
}

async function shouldSendNotification(task, currentTime) {
  const taskDueDate = new Date(task.dueDate);
  const isDue = taskDueDate <= currentTime;

  if (!isDue) return false;

  if (!task.lastNotified) {
    return true;
  }

  const lastNotified = new Date(task.lastNotified);
  const timeSinceLastNotification = currentTime - lastNotified;
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  switch (task.repeatInterval) {
    case 'daily':
      return timeSinceLastNotification >= oneDay;
    case 'weekly':
      return timeSinceLastNotification >= oneWeek;
    case 'monthly':
      return timeSinceLastNotification >= oneMonth;
    case 'none':
      return timeSinceLastNotification >= oneDay;
    default:
      return false;
  }
}

cron.schedule('0 9 * * *', () => {
  console.log('Running daily notification check at 9 AM IST');
  checkAndSendNotifications();
});

cron.schedule('0 */6 * * *', () => {
  console.log('Running 6-hourly notification check');
  checkAndSendNotifications();
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, discordId } = req.body;

    // Check if user with this Discord ID already exists
    const existingUser = await User.findOne({ discordId });
    if (existingUser) {
      return res.status(400).json({ error: `User with Discord ID ${discordId} already exists` });
    }

    const user = new User({ name, discordId });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'A user with this Discord ID already exists' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!category.isDeletable) {
      return res.status(400).json({ error: 'This category cannot be deleted' });
    }

    await Task.deleteMany({ category: id });
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('category')
      .populate('assignedUser')
      .sort({ created_at: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { taskName, dueDate, priority, assignedUser, category, repeatInterval } = req.body;
    const task = new Task({
      taskName,
      dueDate,
      priority,
      assignedUser,
      category,
      repeatInterval: repeatInterval || 'none'
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('category')
      .populate('assignedUser');

    // Send Discord notification for new task creation
    await sendDiscordNotification(populatedTask, populatedTask.assignedUser, 'created');

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName, dueDate, priority, assignedUser, category, repeatInterval } = req.body;

    // Validate required fields
    if (!taskName || !dueDate || !priority || !assignedUser || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate that user exists
    const userExists = await User.findById(assignedUser);
    if (!userExists) {
      return res.status(400).json({ error: 'Assigned user not found' });
    }

    // Validate that category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Validate priority value
    if (!['Easy', 'Medium', 'Hard'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Validate repeat interval if provided
    if (repeatInterval && !['none', 'daily', 'weekly', 'monthly'].includes(repeatInterval)) {
      return res.status(400).json({ error: 'Invalid repeat interval' });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        taskName,
        dueDate,
        priority,
        assignedUser,
        category,
        repeatInterval: repeatInterval || 'none'
      },
      { new: true, runValidators: true }
    ).populate('category').populate('assignedUser');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task: ' + err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate('category')
      .populate('assignedUser');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedCategory = await Category.findOne({ name: 'Deleted Tasks' });

    // If task is already in Deleted Tasks category, permanently delete it
    if (task.category.name === 'Deleted Tasks') {
      await Task.findByIdAndDelete(id);

      // Send permanent delete notification
      await sendDiscordNotification(task, task.assignedUser, 'permanent');

      res.status(200).json({ message: 'Task permanently deleted' });
    } else if (deletedCategory) {
      // Move to Deleted Tasks category
      task.category = deletedCategory;
      task.status = 'deleted';
      await task.save();

      // Send delete notification
      await sendDiscordNotification(task, task.assignedUser, 'delete');

      res.status(200).json({ message: 'Task moved to deleted' });
    } else {
      // If no deleted category exists, permanently delete
      await Task.findByIdAndDelete(id);
      res.status(200).json({ message: 'Task deleted permanently' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const completedCategory = await Category.findOne({ name: 'Completed Tasks' });

    if (!completedCategory) {
      return res.status(404).json({ error: 'Completed Tasks category not found' });
    }

    const task = await Task.findById(id)
      .populate('assignedUser')
      .populate('category');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task
    task.category = completedCategory;
    task.status = 'completed';
    await task.save();

    // Populate the updated task
    await task.populate('category');

    // Send completion notification
    await sendDiscordNotification(task, task.assignedUser, 'complete');

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id/category', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;

    // Find the target category to check if it's special
    const targetCategory = await Category.findById(categoryId);

    if (!targetCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Determine the new status based on the category
    let newStatus = 'active';
    if (targetCategory.name === 'Completed Tasks') {
      newStatus = 'completed';
    } else if (targetCategory.name === 'Deleted Tasks') {
      newStatus = 'deleted';
    }

    // Update both category and status
    const task = await Task.findByIdAndUpdate(
      id,
      {
        category: categoryId,
        status: newStatus
      },
      { new: true }
    ).populate('category').populate('assignedUser');

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/test-notification', async (req, res) => {
  try {
    const { taskId, type = 'reminder' } = req.body;
    const task = await Task.findById(taskId)
      .populate('assignedUser')
      .populate('category');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await sendDiscordNotification(task, task.assignedUser, type);
    res.json({ message: `Test ${type} notification sent successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  checkAndSendNotifications();
});