import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, deleteInvoice, downloadInvoicePDF } from '../utils/api';
import toast from 'react-hot-toast';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const load = () => {
    setLoading(true);
    getInvoices()
      .then(res => setInvoices(res.data))
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Delete invoice ${num}? This cannot be undone.`)) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDownload = async (id, num) => {
    setDownloading(id);
    try {
      const res = await downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${num}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF download failed'); }
    finally { setDownloading(null); }
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /><span>Loading invoices...</span></div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>All Invoices</h2>
        <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>
      <div className="page-body">
        <div className="card">
          {invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗂️</div>
              <h3>No invoices found</h3>
              <p style={{ marginBottom: 16, fontSize: 14 }}>Create your first invoice.</p>
              <Link to="/invoices/new" className="btn btn-primary">Create Invoice</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Items</th>
                    <th>Grand Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id}>
                      <td>
                        <Link to={`/invoices/${inv._id}`}
                          style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="fw-600">{inv.customer.fullName}</td>
                      <td style={{ color: 'var(--text-mid)', fontSize: 13 }}>{inv.customer.email}</td>
                      <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className="badge badge-green">{inv.lineItems.length} items</span>
                      </td>
                      <td className="fw-700" style={{ color: 'var(--primary-dark)', fontSize: 15 }}>
                        ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/invoices/${inv._id}`} className="btn btn-ghost btn-sm">View</Link>
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleDownload(inv._id, inv.invoiceNumber)}
                            disabled={downloading === inv._id}
                          >
                            {downloading === inv._id ? '...' : '⬇ PDF'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                          >Delete</button>
                        </div>
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

export default InvoiceList;
