import React, { useState } from 'react';
import { Plus, Filter, Calendar, Users, Eye, EyeOff } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onAddTask: () => void;
  onAddCategory: (name: string) => void;
  onManageUsers: () => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  filterDueDate: string;
  setFilterDueDate: (value: string) => void;
  showSpecialCategories: boolean;
  setShowSpecialCategories: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddTask,
  onAddCategory,
  onManageUsers,
  filterPriority,
  setFilterPriority,
  filterDueDate,
  setFilterDueDate,
  showSpecialCategories,
  setShowSpecialCategories,
}) => {
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const handleAddCategory = () => {
    if (categoryName.trim()) {
      onAddCategory(categoryName);
      setCategoryName('');
      setShowCategoryInput(false);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="app-title">Work Reminder System</h1>
        </div>

        <div className="header-center">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={16} />
            <select
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={() => setShowSpecialCategories(!showSpecialCategories)}
            className={`btn btn-toggle ${showSpecialCategories ? 'active' : ''}`}
            title={showSpecialCategories ? 'Hide Deleted & Completed' : 'Show Deleted & Completed'}
          >
            {showSpecialCategories ? <EyeOff size={16} /> : <Eye size={16} />}
            DC
          </button>
        </div>

        <div className="header-right">
          <button onClick={onManageUsers} className="btn btn-users">
            <Users size={18} />
            Users
          </button>

          <button onClick={onAddTask} className="btn btn-primary">
            <Plus size={18} />
            Add Task
          </button>

          {showCategoryInput ? (
            <div className="category-input-wrapper">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Category name"
                className="category-input"
                autoFocus
              />
              <button onClick={handleAddCategory} className="btn btn-sm btn-success">
                Add
              </button>
              <button
                onClick={() => {
                  setShowCategoryInput(false);
                  setCategoryName('');
                }}
                className="btn btn-sm btn-cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCategoryInput(true)}
              className="btn btn-secondary"
            >
              <Plus size={18} />
              Add Category
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;