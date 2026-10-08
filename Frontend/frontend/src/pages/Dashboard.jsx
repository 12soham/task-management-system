import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Layers, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import TaskCard from '../components/TaskCard';
import AiBriefingCard from '../components/AiBriefingCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, tasksData] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAllTasks()
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.slice(0, 4));
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        await taskService.deleteTask(id);
        fetchDashboardData();
      } catch {
        alert('Failed to delete task.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const task = recentTasks.find((t) => t.id === id);
      if (task) {
        await taskService.updateTask(id, {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: newStatus
        });
        fetchDashboardData();
      }
    } catch {
      alert('Failed to update task status.');
    }
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name || 'Explorer'}! 👋</h1>
          <p className="page-subtitle">Here is an overview of your task progress and Gemini AI recommendations.</p>
        </div>
        <Link to="/tasks/new" className="btn-primary">
          <PlusCircle size={18} />
          <span>New Task</span>
        </Link>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* AI Daily Standup Briefing Card */}
      <AiBriefingCard />

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-header">
            <span className="stat-label">Total Tasks</span>
            <div className="stat-icon icon-total">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalTasks}</div>
          <Link to="/tasks" className="stat-link">
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-header">
            <span className="stat-label">Completed Tasks</span>
            <div className="stat-icon icon-completed">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.completedTasks}</div>
          <Link to="/tasks?status=COMPLETED" className="stat-link">
            <span>View completed</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-header">
            <span className="stat-label">In Progress</span>
            <div className="stat-icon icon-progress">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.inProgressTasks}</div>
          <Link to="/tasks?status=IN_PROGRESS" className="stat-link">
            <span>View active</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-todo">
          <div className="stat-header">
            <span className="stat-label">Todo Tasks</span>
            <div className="stat-icon icon-todo">
              <ListTodo size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.todoTasks}</div>
          <Link to="/tasks?status=TODO" className="stat-link">
            <span>View backlog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="progress-banner">
        <div className="progress-info">
          <div className="progress-title">
            <TrendingUp size={20} className="progress-icon" />
            <span>Productivity Completion Rate</span>
          </div>
          <span className="progress-percent">{completionRate}% Completed</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Tasks</h2>
          <Link to="/tasks" className="link-subtle">
            See all tasks ({stats.totalTasks}) &rarr;
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={40} className="empty-icon" />
            <h3>No tasks found</h3>
            <p>You haven't created any tasks yet. Create your first task to get started!</p>
            <Link to="/tasks/new" className="btn-primary">
              <PlusCircle size={16} />
              <span>Create First Task</span>
            </Link>
          </div>
        ) : (
          <div className="tasks-grid">
            {recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
