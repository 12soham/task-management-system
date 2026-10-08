import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { 
  PlusCircle, 
  Search, 
  Table as TableIcon, 
  Grid, 
  Trash2, 
  Edit2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import TaskCard from '../components/TaskCard';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'ALL';

  const fetchTasks = async (status) => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAllTasks(status);
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(currentStatus);
  }, [currentStatus]);

  const handleStatusFilterChange = (status) => {
    if (status === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        await taskService.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch {
        alert('Failed to delete task.');
      }
    }
  };

  const handleInlineStatusChange = async (id, newStatus) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const updated = await taskService.updateTask(id, {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: newStatus
        });
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch {
      alert('Failed to update task status.');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = task.title.toLowerCase().includes(term);
    const matchesDesc = task.description ? task.description.toLowerCase().includes(term) : false;
    return matchesTitle || matchesDesc;
  });

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

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">Track, organize, and update all your tasks in one place.</p>
        </div>
        <Link to="/tasks/new" className="btn-primary">
          <PlusCircle size={18} />
          <span>Create Task</span>
        </Link>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar: Filters, Search, and View Mode */}
      <div className="tasks-controls">
        <div className="status-tabs">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusFilterChange(tab)}
              className={`status-tab ${currentStatus === tab ? 'active' : ''}`}
            >
              {tab === 'ALL' ? 'All Tasks' : tab === 'IN_PROGRESS' ? 'In Progress' : tab === 'TODO' ? 'Todo' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="controls-right">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-switch">
            <button 
              onClick={() => setViewMode('table')} 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Table view"
            >
              <TableIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Card grid view"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>
            {searchTerm 
              ? 'No tasks match your search query.' 
              : `No tasks found under the ${currentStatus} category.`}
          </p>
          <Link to="/tasks/new" className="btn-primary" style={{ marginTop: '12px' }}>
            <PlusCircle size={16} />
            <span>Create a Task</span>
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-responsive">
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Title & Description</th>
                <th style={{ width: '150px' }}>Status</th>
                <th style={{ width: '140px' }}>Due Date</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="task-id">#{task.id}</td>
                  <td>
                    <div className="task-name">{task.title}</div>
                    {task.description && (
                      <div className="task-desc-preview">{task.description}</div>
                    )}
                  </td>
                  <td>
                    <div className="status-cell">
                      {getStatusBadge(task.status)}
                      <select
                        value={task.status}
                        onChange={(e) => handleInlineStatusChange(task.id, e.target.value)}
                        className="status-dropdown"
                        title="Update status"
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{task.dueDate || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/tasks/edit/${task.id}`} className="btn-icon" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="btn-icon btn-icon-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onStatusChange={handleInlineStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
