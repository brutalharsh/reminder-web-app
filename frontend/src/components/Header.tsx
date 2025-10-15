import React from 'react';
import { FilterState } from '../types';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  dcToggle: boolean;
  onDCToggle: () => void;
  onAddTask: () => void;
  onManageUsers: () => void;
}

const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  dcToggle,
  onDCToggle,
  onAddTask,
  onManageUsers,
}) => {
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, date: e.target.value });
  };

  return (
    <header className="header">
      <div className="header-top">
        <h1>Work Reminder System</h1>
        <div className="header-actions">
          <button onClick={onAddTask} className="btn btn-primary">
            Add Task
          </button>
          <button onClick={onManageUsers} className="btn btn-secondary">
            Users
          </button>
          <button
            onClick={onDCToggle}
            className={`btn btn-toggle ${dcToggle ? 'active' : ''}`}
          >
            DC
          </button>
        </div>
      </div>
      <div className="header-filters">
        <select value={filters.priority} onChange={handlePriorityChange}>
          <option value="">All Priorities</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select value={filters.date} onChange={handleDateChange}>
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
    </header>
  );
};

export default Header;