import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then(res => setInvoices(res.data))
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, []);

  const total = invoices.reduce((s, i) => s + i.grandTotal, 0);
  const thisMonth = invoices.filter(i => {
    const d = new Date(i.invoiceDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (loading) return (
    <div className="loading-center"><div className="spinner" /><span>Loading dashboard...</span></div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{invoices.length}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{thisMonth.length}</div>
            <div className="stat-sub">{new Date().toLocaleString('default', { month: 'long' })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="stat-sub">Grand total across all invoices</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Invoice Value</div>
            <div className="stat-value">₹{invoices.length ? Math.round(total / invoices.length).toLocaleString('en-IN') : 0}</div>
            <div className="stat-sub">Per invoice</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h3 className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>Recent Invoices</h3>
            <Link to="/invoices" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <h3>No invoices yet</h3>
              <p style={{ marginBottom: 16, fontSize: 14 }}>Create your first invoice to get started.</p>
              <Link to="/invoices/new" className="btn btn-primary">Create Invoice</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Grand Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 8).map(inv => (
                    <tr key={inv._id}>
                      <td><span className="fw-600" style={{ color: 'var(--primary)' }}>{inv.invoiceNumber}</span></td>
                      <td>{inv.customer.fullName}</td>
                      <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                      <td className="fw-600">₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <Link to={`/invoices/${inv._id}`} className="btn btn-ghost btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
