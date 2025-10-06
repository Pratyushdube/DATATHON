import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar bg-gray-800/50 backdrop-blur-sm border-r border-gray-700">
      <nav className="sidebar__nav">
        <ul>
          <li>
            <NavLink to="/" exact activeClassName="active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/alerts" activeClassName="active">
              Alerts
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" activeClassName="active">
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" activeClassName="active">
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;