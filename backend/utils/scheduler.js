const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDiscordNotification } = require('./discord');

function startScheduledJobs() {
    // Run at 9 AM IST every day
    cron.schedule('30 3 * * *', async () => {
        console.log('Running 9 AM IST notification check...');
        await checkAndSendNotifications();
    });

    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('Running 6-hour notification check...');
        await checkAndSendNotifications();
    });

    console.log('Scheduled jobs started');
}

async function checkAndSendNotifications() {
    try {
        const now = new Date();
        const tasks = await Task.find({
            status: 'active',
            dueDate: { $lte: now }
        })
        .populate('assignedUser')
        .populate('category');

        for (const task of tasks) {
            const shouldNotify = shouldSendNotification(task, now);

            if (shouldNotify) {
                await sendDiscordNotification(task, task.assignedUser);
                task.lastNotified = now;
                await task.save();
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

function shouldSendNotification(task, now) {
    if (!task.lastNotified) return true;

    const timeSinceLastNotification = now - new Date(task.lastNotified);
    const hoursSinceLastNotification = timeSinceLastNotification / (1000 * 60 * 60);

    switch (task.repeatInterval) {
        case 'daily':
            return hoursSinceLastNotification >= 24;
        case 'weekly':
            return hoursSinceLastNotification >= 168; // 7 days
        case 'monthly':
            return hoursSinceLastNotification >= 720; // 30 days
        case 'none':
        default:
            return hoursSinceLastNotification >= 24; // Notify once per day for non-repeating tasks
    }
}

module.exports = { startScheduledJobs, checkAndSendNotifications };