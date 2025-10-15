import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AddTaskModal.css';
import { Task, Category, User } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  categories: Category[];
  users: User[];
  editingTask: Task | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  users,
  editingTask,
}) => {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [assignedUser, setAssignedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [repeatInterval, setRepeatInterval] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.taskName);
      setDueDate(new Date(editingTask.dueDate).toISOString().split('T')[0]);
      setPriority(editingTask.priority);
      const userId = editingTask.assignedUser
        ? (typeof editingTask.assignedUser === 'object' ? editingTask.assignedUser._id : editingTask.assignedUser)
        : '';
      setAssignedUser(userId);
      setSelectedCategory(editingTask.category._id);
      setRepeatInterval(editingTask.repeatInterval || 'none');
    } else {
      setTaskName('');
      setDueDate('');
      setPriority('Medium');
      setAssignedUser('');
      setSelectedCategory(categories.filter(cat => !cat.isSpecial)[0]?._id || '');
      setRepeatInterval('none');
    }
  }, [editingTask, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName || !dueDate || !assignedUser || !selectedCategory) {
      alert('Please fill in all fields');
      return;
    }

    const category = categories.find(cat => cat._id === selectedCategory);
    if (!category) return;

    onSubmit({
      taskName,
      dueDate: new Date(dueDate),
      priority,
      assignedUser,
      category: selectedCategory,
      repeatInterval,
    });
  };

  if (!isOpen) return null;

  const regularCategories = categories.filter(cat => !cat.isSpecial);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="taskName">Task Name</label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {regularCategories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Easy' | 'Medium' | 'Hard')}
              className={`priority-select priority-${priority.toLowerCase()}`}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedUser">Assigned User</label>
            <select
              id="assignedUser"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              required
              className="user-select"
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} (Discord: {user.discordId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="repeatInterval">Repeat Reminder</label>
            <select
              id="repeatInterval"
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(e.target.value as 'none' | 'daily' | 'weekly' | 'monthly')}
              className="repeat-select"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;