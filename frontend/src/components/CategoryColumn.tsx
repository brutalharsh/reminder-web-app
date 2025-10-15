import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2, Lock } from 'lucide-react';
import TaskCard from './TaskCard';
import './CategoryColumn.css';
import { Task, Category } from '../types';

interface CategoryColumnProps {
  category: Category;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  category,
  tasks,
  onDeleteTask,
  onEditTask,
  onCompleteTask,
  onDeleteCategory,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: category._id,
  });

  const taskIds = tasks.map(task => task._id);
  const isSpecial = category.isSpecial || false;

  return (
    <div className={`category-column ${isOver ? 'drag-over' : ''} ${isSpecial ? 'special-category' : ''}`}>
      <div className="category-header">
        <h3 className="category-title">
          {category.name}
          {isSpecial && <Lock size={14} className="lock-icon" />}
        </h3>
        <div className="category-actions">
          <span className="task-count">{tasks.length}</span>
          {category.isDeletable !== false && (
            <button
              onClick={() => onDeleteCategory(category._id)}
              className="category-delete-btn"
              title="Delete category"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="tasks-container">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="empty-category">
              <p>No tasks yet</p>
              {!isSpecial && <p className="drag-hint">Drag tasks here</p>}
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onComplete={onCompleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default CategoryColumn;