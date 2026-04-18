const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');

router.get('/', ctrl.getAllInvoices);
router.post('/', ctrl.createInvoice);
router.get('/:id', ctrl.getInvoice);
router.delete('/:id', ctrl.deleteInvoice);
router.get('/:id/pdf', ctrl.downloadPDF);

module.exports = router;
