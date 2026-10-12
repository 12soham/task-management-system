import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/tasks" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          <span>All Tasks</span>
        </NavLink>

        <NavLink 
          to="/tasks/new" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <PlusCircle size={18} />
          <span>Create Task</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="status-legend">
          <div className="legend-title">Task Statuses</div>
          <div className="legend-item"><span className="status-dot dot-todo"></span> Todo</div>
          <div className="legend-item"><span className="status-dot dot-progress"></span> In Progress</div>
          <div className="legend-item"><span className="status-dot dot-completed"></span> Completed</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
