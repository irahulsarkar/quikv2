
export function calculateGST(items, companyStateCode, clientStateCode, shippingAmount = 0, discountAmount = 0, discountType = 'fixed', shippingTaxable = 'yes') {
console.log('Calculating GST for items:', JSON.stringify(items, null, 2)); 
console.log('State Codes:', companyStateCode, clientStateCode); 
console.log('Shipping/Discount:', shippingAmount, discountAmount, discountType, shippingTaxable); 

    let taxableValue = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    
    
    items.forEach(item => {
        const amount = item.rate * item.quantity;
        taxableValue += amount;
    });
    
    
    let discountValue = 0;
    if (discountType === 'fixed') {
        discountValue = parseFloat(discountAmount) || 0;
    } else {
        
        discountValue = (taxableValue * parseFloat(discountAmount)) / 100 || 0;
    }
    
    
    let finalTaxableValue = Math.max(0, taxableValue - discountValue);
    
    
    const shippingAmountValue = parseFloat(shippingAmount) || 0;
    let taxableShippingAmount = 0;
    
    if (shippingTaxable === 'yes' && shippingAmountValue > 0) {
        taxableShippingAmount = shippingAmountValue;
        finalTaxableValue += taxableShippingAmount;
    }
    
    
    const isInterstate = companyStateCode !== clientStateCode;
    
    
    items.forEach(item => {
        const amount = item.rate * item.quantity;
        
        const itemDiscountedAmount = amount - (amount / taxableValue * discountValue);
        const gstRate = parseFloat(item.gstRate) || 0;
        const gstAmount = itemDiscountedAmount * (gstRate / 100);
        
        if (isInterstate) {
            item.igst = gstAmount;
            item.cgst = 0;
            item.sgst = 0;
            totalIGST += gstAmount;
        } else {
            item.igst = 0;
            item.cgst = gstAmount / 2;
            item.sgst = gstAmount / 2;
            totalCGST += gstAmount / 2;
            totalSGST += gstAmount / 2;
        }
    });
    
   
    if (shippingTaxable === 'yes' && shippingAmountValue > 0) {
       
        const shippingGSTRate = items.length > 0 ? parseFloat(items[0].gstRate) : 18;
        const shippingGSTAmount = taxableShippingAmount * (shippingGSTRate / 100);
        
        if (isInterstate) {
            totalIGST += shippingGSTAmount;
        } else {
            totalCGST += shippingGSTAmount / 2;
            totalSGST += shippingGSTAmount / 2;
        }
    }
    
    
    const totalTax = totalCGST + totalSGST + totalIGST;
    const subTotal = finalTaxableValue;
    const grandTotal = subTotal + totalTax + (shippingTaxable === 'no' ? shippingAmountValue : 0);
    console.log('GST Calculation Result:', JSON.stringify({ originalAmount: taxableValue, discountValue, shippingAmount: shippingAmountValue, taxableValue: finalTaxableValue, totalCGST, totalSGST, totalIGST, totalTax, subTotal, grandTotal, isInterstate }, null, 2)); // DEBUGGING LINE - Adjusted to include more relevant values
    return {
        originalAmount: taxableValue,
        discountValue,
        shippingAmount: shippingAmountValue,
        taxableValue: finalTaxableValue,
        totalCGST,
        totalSGST,
        totalIGST,
        totalTax,
        subTotal,
        grandTotal,
        isInterstate
    };
}