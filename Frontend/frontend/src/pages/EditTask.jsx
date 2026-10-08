import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { aiService } from '../services/aiService';
import { Edit3, ArrowLeft, Save, AlertCircle, Sparkles } from 'lucide-react';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');
        const task = await taskService.getTaskById(id);
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'TODO',
          dueDate: task.dueDate || ''
        });
      } catch {
        setError('Failed to load task details. It may not exist or belongs to another user.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiEnhance = async () => {
    if (!formData.title.trim()) {
      setError('Task title is required to enhance with AI.');
      return;
    }

    setAiLoading(true);
    setError('');
    setAiMessage('');

    try {
      const result = await aiService.enhanceTask(formData.title, formData.description);
      setFormData((prev) => ({
        ...prev,
        title: result.enhancedTitle || prev.title,
        description: result.enhancedDescription || prev.description,
        status: result.suggestedStatus || prev.status
      }));
      setAiMessage('✨ Enhanced with Gemini 3.8 Flash!');
    } catch {
      setError('Failed to enhance task with AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        dueDate: formData.dueDate ? formData.dueDate : null
      };
      await taskService.updateTask(id, payload);
      navigate('/tasks');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update task. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading task details...</p>
      </div>
    );
  }

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
            <Edit3 size={22} color="#ffffff" />
          </div>
          <div className="form-card-header-text">
            <h2>Edit Task #{id}</h2>
            <p>Update task information or polish with Gemini AI</p>
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
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={aiLoading || !formData.title.trim()}
                className="btn-ai-action"
                title="Enhance task using Gemini AI"
              >
                <Sparkles size={14} className={aiLoading ? 'spinning' : ''} />
                <span>{aiLoading ? 'Enhancing...' : 'Enhance with AI'}</span>
              </button>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Learn React Router"
              required
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
              placeholder="Provide more context or notes for this task..."
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

          <div className="form-actions">
            <Link to="/tasks" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
