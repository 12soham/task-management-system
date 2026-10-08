import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit2, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-progress">In Progress</span>;
      case 'TODO':
      default:
        return <span className="badge badge-todo">Todo</span>;
    }
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'COMPLETED') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    return due < today;
  };

  return (
    <div className={`task-card ${task.status.toLowerCase()}`}>
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        {getStatusBadge(task.status)}
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className={`task-card-date ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
          <Calendar size={14} />
          <span>{task.dueDate ? task.dueDate : 'No due date'}</span>
          {isOverdue(task.dueDate, task.status) && <span className="overdue-tag">Overdue</span>}
        </div>

        <div className="task-card-actions">
          <select 
            value={task.status} 
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="status-select-inline"
            title="Change status"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <Link to={`/tasks/edit/${task.id}`} className="btn-icon" title="Edit task">
            <Edit2 size={15} />
          </Link>

          <button 
            onClick={() => onDelete(task.id)} 
            className="btn-icon btn-icon-danger" 
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
