import React, { useEffect, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', basePrice: '', variants: [] };

const ItemModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState(item || emptyForm);
  const [variantLabel, setVariantLabel] = useState('');
  const [variantValue, setVariantValue] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addVariant = () => {
    if (!variantLabel.trim() || !variantValue.trim()) return;
    set('variants', [...form.variants, { label: variantLabel.trim(), value: variantValue.trim() }]);
    setVariantLabel(''); setVariantValue('');
  };

  const removeVariant = (idx) => set('variants', form.variants.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!form.name.trim() || !form.basePrice) return toast.error('Name and base price are required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      toast.error('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{item?._id ? 'Edit Item' : 'Add New Item'}</h3>
        <div className="form-grid form-grid-2" style={{ marginBottom: 18 }}>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Grilled Chicken Salad" />
          </div>
          <div className="form-group">
            <label className="form-label">Base Price (₹) *</label>
            <input className="form-input" type="number" min="0" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 18 }}>
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description..." style={{ minHeight: 64 }} />
        </div>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label">Variants (optional)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={variantLabel} onChange={e => setVariantLabel(e.target.value)} placeholder="Label (e.g. Size)" style={{ flex: 1 }} />
            <input className="form-input" value={variantValue} onChange={e => setVariantValue(e.target.value)} placeholder="Value (e.g. Large)" style={{ flex: 1 }} />
            <button className="btn btn-outline btn-sm" onClick={addVariant} type="button">Add</button>
          </div>
          {form.variants.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {form.variants.map((v, i) => (
                <span key={i} className="variant-tag">
                  {v.label}: {v.value}
                  <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 13, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : item?._id ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | item object

  const load = () => {
    setLoading(true);
    getItems()
      .then(res => setItems(res.data))
      .catch(() => toast.error('Failed to load items'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (modal?._id) {
      await updateItem(modal._id, form);
      toast.success('Item updated!');
    } else {
      await createItem(form);
      toast.success('Item added!');
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteItem(id);
      toast.success('Item deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Items & Inventory</h2>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Item</button>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Loading items...</span></div>
        ) : (
          <div className="card">
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No items yet</h3>
                <p style={{ marginBottom: 16, fontSize: 14 }}>Add your first product or menu item.</p>
                <button className="btn btn-primary" onClick={() => setModal('add')}>Add Item</button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Variants</th>
                      <th>Base Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item._id}>
                        <td className="fw-600">{item.name}</td>
                        <td style={{ color: 'var(--text-mid)', maxWidth: 200 }}>{item.description || '—'}</td>
                        <td>
                          {item.variants?.length > 0
                            ? item.variants.map((v, i) => (
                              <span key={i} className="variant-tag" style={{ marginRight: 4 }}>
                                {v.label}: {v.value}
                              </span>
                            ))
                            : <span style={{ color: 'var(--text-light)' }}>—</span>}
                        </td>
                        <td className="fw-600" style={{ color: 'var(--primary)' }}>₹{Number(item.basePrice).toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(item)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {modal && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Items;
