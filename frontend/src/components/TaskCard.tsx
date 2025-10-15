import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, Clock, User, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import './TaskCard.css';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onComplete, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priorityClass = `priority-${task.priority.toLowerCase()}`;
  const isOverdue = new Date(task.dueDate) < new Date() &&
    new Date(task.dueDate).toDateString() !== new Date().toDateString();

  const isCompleted = task.status === 'completed';
  const isDeleted = task.status === 'deleted';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${priorityClass} ${isOverdue ? 'overdue' : ''} ${isDragging ? 'dragging' : ''} ${isCompleted ? 'completed' : ''} ${isDeleted ? 'deleted' : ''}`}
    >
      <div className="task-header">
        <div className="task-drag-handle" {...attributes} {...listeners}>
          <h4 className="task-title">{task.taskName}</h4>
        </div>
        <div className="task-actions">
          {!isCompleted && !isDeleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onComplete(task._id);
              }}
              className="task-btn complete-btn"
              title="Mark as complete"
            >
              <CheckCircle size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit(task);
            }}
            className="task-btn edit-btn"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(task._id);
            }}
            className="task-btn delete-btn"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="task-body" {...attributes} {...listeners}>
        <div className="task-info">
          <span className="task-date">
            <Clock size={12} />
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </span>
          <span className="task-user">
            <User size={12} />
            {task.assignedUser ? (typeof task.assignedUser === 'object' ? task.assignedUser.name : task.assignedUser) : 'Unassigned'}
          </span>
        </div>
        <div className="task-badges">
          <div className={`priority-badge ${priorityClass}`}>
            {task.priority}
          </div>
          {task.repeatInterval && task.repeatInterval !== 'none' && (
            <div className="repeat-badge">
              <RefreshCw size={12} />
              {task.repeatInterval}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;