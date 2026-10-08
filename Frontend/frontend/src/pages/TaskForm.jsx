import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { aiService } from '../services/aiService';
import { CheckSquare, ArrowLeft, Save, AlertCircle, Sparkles, ListTree, Check } from 'lucide-react';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [creatingSubtasks, setCreatingSubtasks] = useState(false);
  const [error, setError] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiEnhance = async () => {
    if (!formData.title.trim()) {
      setError('Please provide at least a title keyword or idea for AI to enhance.');
      return;
    }

    setAiLoading(true);
    setError('');
    setAiMessage('');

    try {
      const result = await aiService.enhanceTask(formData.title, formData.description);
      let calculatedDueDate = formData.dueDate;

      if (!calculatedDueDate && result.suggestedDueDateDays) {
        const d = new Date();
        d.setDate(d.getDate() + result.suggestedDueDateDays);
        calculatedDueDate = d.toISOString().split('T')[0];
      }

      setFormData((prev) => ({
        ...prev,
        title: result.enhancedTitle || prev.title,
        description: result.enhancedDescription || prev.description,
        status: result.suggestedStatus || prev.status,
        dueDate: calculatedDueDate
      }));
      setAiMessage('✨ Enhanced with Gemini 3.8 Flash!');
    } catch {
      setError('Failed to enhance task with AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiBreakdown = async () => {
    if (!formData.title.trim()) {
      setError('Please provide a task title to break down into subtasks.');
      return;
    }

    setBreakdownLoading(true);
    setError('');

    try {
      const result = await aiService.breakdownTask(formData.title, formData.description);
      setSubtasks(result.subtasks || []);
    } catch {
      setError('Failed to generate subtasks with AI.');
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleCreateAllSubtasks = async () => {
    if (subtasks.length === 0) return;
    setCreatingSubtasks(true);
    try {
      const today = new Date();
      for (const item of subtasks) {
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + (item.daysFromNow || 2));
        await taskService.createTask({
          title: item.title,
          description: item.description,
          status: item.status || 'TODO',
          dueDate: dueDate.toISOString().split('T')[0]
        });
      }
      navigate('/tasks');
    } catch {
      setError('Failed to batch create subtasks.');
    } finally {
      setCreatingSubtasks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        dueDate: formData.dueDate ? formData.dueDate : null
      };
      await taskService.createTask(payload);
      navigate('/tasks');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="page-header-nav">
        <Link to="/tasks" className="btn-back">
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </Link>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div className="form-icon">
            <CheckSquare size={22} color="#ffffff" />
          </div>
          <div className="form-card-header-text">
            <h2>Create New Task</h2>
            <p>Add a new task manually or generate with Gemini AI</p>
          </div>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {aiMessage && (
          <div className="alert-ai-success">
            <Sparkles size={16} />
            <span>{aiMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="title">Task Title <span className="required">*</span></label>
              <div className="ai-actions-row">
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={aiLoading || !formData.title.trim()}
                  className="btn-ai-action"
                  title="Generate detailed objectives, criteria, and timeline"
                >
                  <Sparkles size={14} className={aiLoading ? 'spinning' : ''} />
                  <span>{aiLoading ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAiBreakdown}
                  disabled={breakdownLoading || !formData.title.trim()}
                  className="btn-ai-action btn-ai-action-secondary"
                  title="Break down into actionable subtasks"
                >
                  <ListTree size={14} className={breakdownLoading ? 'spinning' : ''} />
                  <span>{breakdownLoading ? 'Breaking down...' : 'Breakdown (Subtasks)'}</span>
                </button>
              </div>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Build authentication system"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Markdown Supported)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide context, acceptance criteria, or use 'Enhance with AI' above..."
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Subtasks breakdown preview if generated */}
          {subtasks.length > 0 && (
            <div className="ai-subtasks-preview">
              <div className="ai-subtasks-header">
                <div className="ai-subtasks-title">
                  <ListTree size={16} color="#4f46e5" />
                  <span>Gemini Suggested Subtasks ({subtasks.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleCreateAllSubtasks}
                  disabled={creatingSubtasks}
                  className="btn-ai-batch"
                >
                  <Check size={14} />
                  <span>{creatingSubtasks ? 'Adding...' : 'Add All to Board'}</span>
                </button>
              </div>
              <div className="ai-subtasks-list">
                {subtasks.map((st, i) => (
                  <div key={i} className="ai-subtask-item">
                    <div className="ai-subtask-title">
                      <strong>{i + 1}. {st.title}</strong>
                      <span className="badge badge-todo">{st.status}</span>
                    </div>
                    <p className="ai-subtask-desc">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <Link to="/tasks" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
