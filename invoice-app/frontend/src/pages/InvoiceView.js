import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInvoice, downloadInvoicePDF, deleteInvoice } from '../utils/api';
import toast from 'react-hot-toast';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getInvoice(id)
      .then(res => setInvoice(res.data))
      .catch(() => { toast.error('Invoice not found'); navigate('/invoices'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF download failed'); }
    finally { setDownloading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner" /><span>Loading invoice...</span></div>
  );

  if (!invoice) return null;

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/invoices" className="btn btn-ghost btn-sm">← Back</Link>
          <h2 style={{ margin: 0 }}>{invoice.invoiceNumber}</h2>
          <span className="badge badge-amber">Unpaid</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          <button className="btn btn-accent" onClick={handleDownload} disabled={downloading}>
            {downloading ? '⏳ Generating...' : '⬇ Download PDF'}
          </button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-title">Invoice Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Invoice Number', invoice.invoiceNumber],
                ['Invoice Date', fmtDate(invoice.invoiceDate)],
                ['Due Date', fmtDate(invoice.dueDate)],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-mid)' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Billed To</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-dark)' }}>{invoice.customer.fullName}</div>
              <div style={{ color: 'var(--text-mid)' }}>{invoice.customer.phone}</div>
              <div style={{ color: 'var(--text-mid)' }}>{invoice.customer.email}</div>
              <div style={{ color: 'var(--text-mid)', marginTop: 4, lineHeight: 1.5 }}>{invoice.customer.address}</div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="card">
          <div className="card-title">Line Items</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Base Price</th>
                  <th>GST %</th>
                  <th>Discount</th>
                  <th>Row Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((li, i) => (
                  <tr key={i}>
                    <td className="fw-600">{li.itemName}</td>
                    <td style={{ color: 'var(--text-mid)' }}>{li.variant || '—'}</td>
                    <td>{li.quantity}</td>
                    <td>₹{li.basePrice.toFixed(2)}</td>
                    <td><span className="badge badge-green">{li.gstPercent}%</span></td>
                    <td>
                      {li.discountValue > 0
                        ? li.discountType === 'percent'
                          ? `${li.discountValue}%`
                          : `₹${li.discountValue.toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="fw-700" style={{ color: 'var(--primary)' }}>₹{li.rowTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="section-divider" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="summary-box">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Discount</span>
                <span className="summary-value text-red">- ₹{invoice.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total GST</span>
                <span className="summary-value">+ ₹{invoice.totalGst.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary)', fontSize: 20 }}>
                  ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="card-title" style={{ fontSize: 14 }}>Terms & Conditions</div>
          <ol style={{ paddingLeft: 18, color: 'var(--text-mid)', fontSize: 13.5, lineHeight: 2 }}>
            <li>Payment Terms: Payment is due within 15 days of the invoice date.</li>
            <li>Late Fees: A late fee of 2% per month will be applied to overdue balances.</li>
            <li>Jurisdiction: All disputes are subject to Bengaluru jurisdiction only.</li>
            <li>Thank you for choosing HealthyChef!</li>
          </ol>
        </div>

        {/* Download CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-accent btn-lg" onClick={handleDownload} disabled={downloading}>
            {downloading ? '⏳ Generating PDF...' : '⬇ Download Invoice PDF'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoiceView;
