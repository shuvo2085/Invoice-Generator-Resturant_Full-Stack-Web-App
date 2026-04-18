import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, createInvoice } from '../utils/api';
import { calcRowTotal, calcInvoiceSummary } from '../utils/calc';
import toast from 'react-hot-toast';

const GST_OPTIONS = [0, 5, 12, 18, 28];

const emptyLineItem = () => ({
  _key: Math.random().toString(36).slice(2),
  itemId: '',
  itemName: '',
  variant: '',
  quantity: 1,
  basePrice: 0,
  gstPercent: 5,
  discountType: 'percent',
  discountValue: 0,
  rowTotal: 0,
});

const emptyCustomer = { fullName: '', phone: '', email: '', address: '' };

const NewInvoice = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getItems()
      .then(res => setItems(res.data))
      .catch(() => toast.error('Could not load items'));
  }, []);

  const setCustomerField = (k, v) => setCustomer(c => ({ ...c, [k]: v }));

  const updateLineItem = useCallback((key, patch) => {
    setLineItems(prev =>
      prev.map(li => {
        if (li._key !== key) return li;
        const updated = { ...li, ...patch };
        updated.rowTotal = calcRowTotal(updated);
        return updated;
      })
    );
  }, []);

  const selectItem = (key, itemId) => {
    const found = items.find(i => i._id === itemId);
    if (!found) return;
    const variantStr = found.variants?.length
      ? found.variants.map(v => `${v.label}: ${v.value}`).join(', ')
      : '';
    updateLineItem(key, {
      itemId: found._id,
      itemName: found.name,
      variant: variantStr,
      basePrice: found.basePrice,
    });
  };

  const addLineItem = () => setLineItems(prev => [...prev, emptyLineItem()]);

  const removeLineItem = (key) => {
    if (lineItems.length === 1) return toast.error('At least one item is required');
    setLineItems(prev => prev.filter(li => li._key !== key));
  };

  const summary = calcInvoiceSummary(lineItems);

  const handleSubmit = async () => {
    if (!customer.fullName || !customer.phone || !customer.email || !customer.address) {
      return toast.error('Please fill all customer details');
    }
    const hasItems = lineItems.every(li => li.itemName.trim());
    if (!hasItems) return toast.error('Each line item must have an item selected');

    setSaving(true);
    try {
      const payload = {
        customer,
        lineItems: lineItems.map(({ _key, ...rest }) => rest),
        ...summary,
      };
      const res = await createInvoice(payload);
      toast.success(`Invoice ${res.data.invoiceNumber} created!`);
      navigate(`/invoices/${res.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>New Invoice</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/invoices')}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Invoice'}
          </button>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── AUTO-GENERATED META ─────────────────────────────── */}
        <div className="card">
          <div className="card-title">Invoice Details</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <input className="form-input" value="Auto-generated on save" disabled
                style={{ color: 'var(--text-light)', fontStyle: 'italic' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Date</label>
              <input className="form-input" value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} disabled
                style={{ color: 'var(--text-mid)' }} />
            </div>
          </div>
        </div>

        {/* ── CUSTOMER DETAILS ────────────────────────────────── */}
        <div className="card">
          <div className="card-title">Customer Details</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={customer.fullName}
                onChange={e => setCustomerField('fullName', e.target.value)}
                placeholder="e.g. Rohan Sharma" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className="form-input" value={customer.phone}
                onChange={e => setCustomerField('phone', e.target.value)}
                placeholder="+91-XXXXXXXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Email ID *</label>
              <input className="form-input" type="email" value={customer.email}
                onChange={e => setCustomerField('email', e.target.value)}
                placeholder="customer@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Billing Address *</label>
              <input className="form-input" value={customer.address}
                onChange={e => setCustomerField('address', e.target.value)}
                placeholder="Full billing address" />
            </div>
          </div>
        </div>

        {/* ── LINE ITEMS ───────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">Line Items</div>

          {/* Header labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1.2fr 1fr auto',
            gap: 10,
            padding: '0 16px 8px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <span>Item</span>
            <span>Variant / Custom</span>
            <span>Qty</span>
            <span>Price (₹)</span>
            <span>GST %</span>
            <span>Discount</span>
            <span></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lineItems.map(li => (
              <div key={li._key} className="line-item-row">
                {/* Item selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    className="form-select"
                    value={li.itemId}
                    onChange={e => selectItem(li._key, e.target.value)}
                  >
                    <option value="">— Select Item —</option>
                    {items.map(it => (
                      <option key={it._id} value={it._id}>{it.name} (₹{it.basePrice})</option>
                    ))}
                  </select>
                </div>

                {/* Variant */}
                <input
                  className="form-input"
                  value={li.variant}
                  onChange={e => updateLineItem(li._key, { variant: e.target.value })}
                  placeholder="Variant / description"
                />

                {/* Quantity */}
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={li.quantity}
                  onChange={e => updateLineItem(li._key, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                />

                {/* Base Price */}
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={li.basePrice}
                  onChange={e => updateLineItem(li._key, { basePrice: parseFloat(e.target.value) || 0 })}
                />

                {/* GST */}
                <select
                  className="form-select"
                  value={li.gstPercent}
                  onChange={e => updateLineItem(li._key, { gstPercent: parseFloat(e.target.value) })}
                >
                  {GST_OPTIONS.map(g => <option key={g} value={g}>{g}%</option>)}
                </select>

                {/* Discount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="discount-toggle">
                    <button
                      type="button"
                      className={li.discountType === 'percent' ? 'active' : ''}
                      onClick={() => updateLineItem(li._key, { discountType: 'percent' })}
                    >%</button>
                    <button
                      type="button"
                      className={li.discountType === 'absolute' ? 'active' : ''}
                      onClick={() => updateLineItem(li._key, { discountType: 'absolute' })}
                    >₹</button>
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={li.discountValue}
                    onChange={e => updateLineItem(li._key, { discountValue: parseFloat(e.target.value) || 0 })}
                    placeholder={li.discountType === 'percent' ? '0%' : '₹0'}
                  />
                </div>

                {/* Remove */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'var(--surface-2)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    whiteSpace: 'nowrap'
                  }}>
                    ₹{li.rowTotal.toFixed(2)}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeLineItem(li._key)}
                    title="Remove"
                    style={{ padding: '4px 10px' }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <button className="btn btn-outline" onClick={addLineItem}>+ Add Line Item</button>
          </div>

          {/* Summary */}
          <hr className="section-divider" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="summary-box">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Discount</span>
                <span className="summary-value text-red">- ₹{summary.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total GST</span>
                <span className="summary-value">+ ₹{summary.totalGst.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TERMS PREVIEW ────────────────────────────────────── */}
        <div className="card" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}>
          <div className="card-title" style={{ fontSize: 14 }}>Terms & Conditions (printed on PDF)</div>
          <ol style={{ paddingLeft: 18, color: 'var(--text-mid)', fontSize: 13.5, lineHeight: 2 }}>
            <li>Payment Terms: Payment is due within 15 days of the invoice date.</li>
            <li>Late Fees: A late fee of 2% per month will be applied to overdue balances.</li>
            <li>Jurisdiction: All disputes are subject to Bengaluru jurisdiction only.</li>
            <li>Thank you for choosing HealthyChef!</li>
          </ol>
        </div>

        {/* ── SAVE BUTTON ──────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/invoices')}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={saving}>
            {saving ? '⏳ Saving Invoice...' : '💾 Save Invoice'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewInvoice;
