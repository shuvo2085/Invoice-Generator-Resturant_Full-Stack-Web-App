const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = new Invoice({
      ...req.body,
      invoiceNumber,
      invoiceDate,
      dueDate
    });
    const saved = await invoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    // ─── COLORS & FONTS ───────────────────────────────────────────────
    const PRIMARY = '#1A5C38';
    const ACCENT = '#F5A623';
    const LIGHT_BG = '#F7FAF8';
    const TEXT_DARK = '#1C1C1C';
    const TEXT_MID = '#555555';
    const TEXT_LIGHT = '#888888';
    const TABLE_HEADER_BG = '#1A5C38';
    const TABLE_ROW_ALT = '#EDF5F0';
    const PAGE_WIDTH = doc.page.width - 100; // margins of 50 each side

    // ─── HEADER BANNER ───────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill(PRIMARY);

    // Company name
    doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold')
      .text('HealthyChef', 50, 28, { characterSpacing: 1 });

    doc.fillColor(ACCENT).fontSize(10).font('Helvetica')
      .text('Fresh · Healthy · Delivered', 50, 58, { characterSpacing: 0.5 });

    // INVOICE label on right
    doc.fillColor('#FFFFFF').fontSize(30).font('Helvetica-Bold')
      .text('INVOICE', 0, 28, { align: 'right', width: doc.page.width - 50 });

    doc.fillColor(ACCENT).fontSize(11).font('Helvetica')
      .text(invoice.invoiceNumber, 0, 62, { align: 'right', width: doc.page.width - 50 });

    // ─── INVOICE META ─────────────────────────────────────────────────
    const metaY = 130;
    doc.rect(50, metaY, PAGE_WIDTH, 65).fill(LIGHT_BG).stroke('#D8EAE1');

    doc.fillColor(TEXT_MID).fontSize(9).font('Helvetica')
      .text('INVOICE DATE', 70, metaY + 10)
      .text('DUE DATE', 230, metaY + 10)
      .text('STATUS', 390, metaY + 10);

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold')
      .text(fmtDate(invoice.invoiceDate), 70, metaY + 26)
      .text(fmtDate(invoice.dueDate), 230, metaY + 26);

    // Status badge
    doc.rect(390, metaY + 22, 70, 20).fill(ACCENT);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
      .text('UNPAID', 393, metaY + 28, { width: 64, align: 'center' });

    // ─── BILLED TO ────────────────────────────────────────────────────
    const billY = 218;
    doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold')
      .text('BILLED TO', 50, billY, { characterSpacing: 1.5 });
    doc.moveTo(50, billY + 13).lineTo(200, billY + 13).lineWidth(1.5).stroke(ACCENT);

    doc.fillColor(TEXT_DARK).fontSize(13).font('Helvetica-Bold')
      .text(invoice.customer.fullName, 50, billY + 20);
    doc.fillColor(TEXT_MID).fontSize(10).font('Helvetica')
      .text(invoice.customer.phone, 50, billY + 37)
      .text(invoice.customer.email, 50, billY + 52)
      .text(invoice.customer.address, 50, billY + 67, { width: 280 });

    // ─── LINE ITEMS TABLE ─────────────────────────────────────────────
    const tableY = billY + 115;

    // Table header
    const cols = [50, 150, 50, 80, 50, 70, 70, 85];
    const colX = [50];
    for (let i = 1; i < cols.length; i++) colX.push(colX[i-1] + cols[i-1]);

    doc.rect(50, tableY, PAGE_WIDTH, 22).fill(TABLE_HEADER_BG);
    const headers = ['ITEM', 'VARIANT', 'QTY', 'PRICE (₹)', 'GST%', 'DISC', 'TYPE', 'TOTAL (₹)'];
    headers.forEach((h, i) => {
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
        .text(h, colX[i] + 4, tableY + 7, { width: cols[i] - 6, align: i >= 3 ? 'right' : 'left' });
    });

    let rowY = tableY + 22;
    invoice.lineItems.forEach((item, idx) => {
      const rowH = 22;
      if (idx % 2 === 0) doc.rect(50, rowY, PAGE_WIDTH, rowH).fill(TABLE_ROW_ALT);
      else doc.rect(50, rowY, PAGE_WIDTH, rowH).fill('#FFFFFF');

      const discStr = item.discountType === 'percent'
        ? `${item.discountValue}%`
        : `₹${item.discountValue.toFixed(2)}`;

      const rowData = [
        item.itemName,
        item.variant || '-',
        String(item.quantity),
        item.basePrice.toFixed(2),
        `${item.gstPercent}%`,
        discStr,
        item.discountType === 'percent' ? '%' : '₹',
        item.rowTotal.toFixed(2)
      ];

      rowData.forEach((d, i) => {
        doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica')
          .text(d, colX[i] + 4, rowY + 7, { width: cols[i] - 6, align: i >= 3 ? 'right' : 'left' });
      });

      rowY += rowH;
    });

    // Table bottom border
    doc.moveTo(50, rowY).lineTo(50 + PAGE_WIDTH, rowY).lineWidth(1).stroke(PRIMARY);

    // ─── SUMMARY BOX ─────────────────────────────────────────────────
    const sumX = doc.page.width - 50 - 230;
    const sumY = rowY + 15;
    const sumW = 230;

    doc.rect(sumX, sumY, sumW, 110).fill(LIGHT_BG).stroke('#D8EAE1');

    const summaryRows = [
      ['Subtotal', `₹ ${invoice.subtotal.toFixed(2)}`],
      ['Total Discount', `- ₹ ${invoice.totalDiscount.toFixed(2)}`],
      ['Total GST', `+ ₹ ${invoice.totalGst.toFixed(2)}`],
    ];

    let sY = sumY + 12;
    summaryRows.forEach(([label, value]) => {
      doc.fillColor(TEXT_MID).fontSize(9).font('Helvetica').text(label, sumX + 12, sY);
      doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold').text(value, sumX, sY, { width: sumW - 12, align: 'right' });
      sY += 18;
    });

    // Grand total
    doc.moveTo(sumX, sY).lineTo(sumX + sumW, sY).lineWidth(1).stroke(PRIMARY);
    sY += 8;
    doc.rect(sumX, sY, sumW, 26).fill(PRIMARY);
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
      .text('GRAND TOTAL', sumX + 12, sY + 8);
    doc.fillColor(ACCENT).fontSize(11).font('Helvetica-Bold')
      .text(`₹ ${invoice.grandTotal.toFixed(2)}`, sumX, sY + 7, { width: sumW - 12, align: 'right' });

    // ─── TERMS & CONDITIONS ───────────────────────────────────────────
    const termsY = Math.max(sumY + 130, rowY + 30);
    doc.moveTo(50, termsY).lineTo(50 + PAGE_WIDTH, termsY).lineWidth(0.5).stroke('#CCCCCC');

    doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold')
      .text('TERMS & CONDITIONS', 50, termsY + 12, { characterSpacing: 1 });

    const terms = [
      '1. Payment Terms: Payment is due within 15 days of the invoice date.',
      '2. Late Fees: A late fee of 2% per month will be applied to overdue balances.',
      '3. Jurisdiction: All disputes are subject to Bengaluru jurisdiction only.',
      '4. Thank you for choosing HealthyChef!'
    ];
    let tY = termsY + 27;
    terms.forEach(t => {
      doc.fillColor(TEXT_LIGHT).fontSize(8.5).font('Helvetica').text(t, 50, tY, { width: PAGE_WIDTH });
      tY += 14;
    });

    // ─── FOOTER ───────────────────────────────────────────────────────
    const footerY = doc.page.height - 45;
    doc.rect(0, footerY, doc.page.width, 45).fill(PRIMARY);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica')
      .text('HealthyChef — Fresh, Healthy, Delivered', 50, footerY + 10, { align: 'center', width: doc.page.width - 100 });
    doc.fillColor(ACCENT).fontSize(8)
      .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 50, footerY + 25, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
