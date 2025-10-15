import React, { useState, useEffect } from 'react';
import { User, Category, Task } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  users: User[];
  categories: Category[];
  editingTask?: Task | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
  categories,
  editingTask,
}) => {
  const [formData, setFormData] = useState({
    taskName: '',
    dueDate: '',
    priority: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    assignedUser: '',
    category: '',
    repeatInterval: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        taskName: editingTask.taskName,
        dueDate: editingTask.dueDate.split('T')[0],
        priority: editingTask.priority,
        assignedUser: editingTask.assignedUser._id,
        category: editingTask.category._id,
        repeatInterval: editingTask.repeatInterval,
      });
    } else {
      setFormData({
        taskName: '',
        dueDate: '',
        priority: 'Medium',
        assignedUser: '',
        category: '',
        repeatInterval: 'none',
      });
    }
  }, [editingTask]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const filteredCategories = categories.filter(cat => !cat.isSpecial);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="taskName"
            value={formData.taskName}
            onChange={handleChange}
            placeholder="Task Name"
            required
          />
          <input
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            name="assignedUser"
            value={formData.assignedUser}
            onChange={handleChange}
            required
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.discordId})
              </option>
            ))}
          </select>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {filteredCategories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            name="repeatInterval"
            value={formData.repeatInterval}
            onChange={handleChange}
          >
            <option value="none">No Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Update' : 'Add'} Task
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;