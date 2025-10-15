import React from 'react';
import { Category, Task } from '../types';

interface CategoryColumnProps {
  category: Category;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  children?: React.ReactNode;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  category,
  tasks,
  onTaskClick,
  children,
}) => {
  return (
    <div className="category-column">
      <div className="category-header">
        <h2>{category.name}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="tasks-container">
        {tasks.map(task => (
          <div
            key={task._id}
            className="task-item"
            onClick={() => onTaskClick(task)}
          >
            {task.taskName}
          </div>
        ))}
        {children}
      </div>
    </div>
  );
};

export default CategoryColumn;