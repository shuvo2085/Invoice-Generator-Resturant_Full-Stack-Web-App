import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>HealthyChef</h1>
        <span>Invoicing Suite</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-label">Main</div>
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/invoices/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">✏️</span> New Invoice
        </NavLink>
        <NavLink to="/invoices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">🗂️</span> All Invoices
        </NavLink>
        <div className="nav-label" style={{ marginTop: 12 }}>Inventory</div>
        <NavLink to="/items" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📦</span> Items & Products
        </NavLink>
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          HealthyChef © 2026<br />Fresh · Healthy · Delivered
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
