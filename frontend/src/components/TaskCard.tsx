import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'active';

  const priorityClass = task.priority.toLowerCase();
  const cardClass = `task-card ${priorityClass} ${isOverdue ? 'overdue' : ''}`;

  return (
    <div className={cardClass}>
      <div className="task-header">
        <h3>{task.taskName}</h3>
        <span className={`priority-badge ${priorityClass}`}>
          {task.priority}
        </span>
      </div>
      <div className="task-details">
        <p className="task-user">{task.assignedUser.name}</p>
        <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
        {task.repeatInterval !== 'none' && (
          <p className="task-repeat">Repeats: {task.repeatInterval}</p>
        )}
      </div>
      <div className="task-actions">
        {task.status === 'active' && (
          <button
            onClick={() => onComplete(task._id)}
            className="btn btn-complete"
            title="Complete Task"
          >
            ✓
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="btn btn-edit"
          title="Edit Task"
        >
          ✎
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="btn btn-delete"
          title="Delete Task"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default TaskCard;