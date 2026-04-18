import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Items
export const getItems = () => api.get('/items');
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);

// Invoices
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const downloadInvoicePDF = (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

export default api;
