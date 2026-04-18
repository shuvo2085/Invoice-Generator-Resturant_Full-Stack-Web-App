/**
 * Calculate row total for a line item.
 * Formula: (basePrice * qty) - discount + GST on discounted amount
 */
export const calcRowTotal = (item) => {
  const { basePrice = 0, quantity = 1, gstPercent = 0, discountType = 'percent', discountValue = 0 } = item;
  const gross = basePrice * quantity;
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (gross * discountValue) / 100;
  } else {
    discountAmount = parseFloat(discountValue) || 0;
  }
  const afterDiscount = gross - discountAmount;
  const gstAmount = (afterDiscount * gstPercent) / 100;
  return parseFloat((afterDiscount + gstAmount).toFixed(2));
};

export const calcInvoiceSummary = (lineItems) => {
  let subtotal = 0, totalDiscount = 0, totalGst = 0;

  lineItems.forEach(item => {
    const { basePrice = 0, quantity = 1, gstPercent = 0, discountType = 'percent', discountValue = 0 } = item;
    const gross = basePrice * quantity;
    subtotal += gross;

    let discountAmount = 0;
    if (discountType === 'percent') discountAmount = (gross * discountValue) / 100;
    else discountAmount = parseFloat(discountValue) || 0;

    totalDiscount += discountAmount;
    const afterDiscount = gross - discountAmount;
    totalGst += (afterDiscount * gstPercent) / 100;
  });

  const grandTotal = subtotal - totalDiscount + totalGst;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalGst: parseFloat(totalGst.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};
