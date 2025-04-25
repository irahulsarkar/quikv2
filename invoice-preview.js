import { numberToWords } from './src/utils/numberToWords.js';
import { calculateGST } from './src/utils/gstCalculator.js';

// Function to group items by HSN code
function groupItemsByHSN(items) {
    const hsnGroups = {};
    
    items.forEach(item => {
        const hsn = item.hsn || 'XXXXXX';
        if (!hsnGroups[hsn]) {
            hsnGroups[hsn] = {
                items: [],
                taxableValue: 0,
                gstRate: item.gstRate,
                cgst: 0,
                sgst: 0,
                igst: 0
            };
        }
        hsnGroups[hsn].items.push(item);
        hsnGroups[hsn].taxableValue += item.amount;
    });
    
    return hsnGroups;
}

// Function to update the invoice preview
export function updatePreview() {
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;
    
    const logoPreview = document.getElementById('logoPreview');
    const logoImg = logoPreview.querySelector('img');
    const logoHTML = logoImg ? `<img src="${logoImg.src}" alt="Company Logo" class="preview-logo">` : '';
    
    const companyName = document.getElementById('companyName').value || 'Your Company Name';
    const companyAddress = document.getElementById('companyAddress').value || 'Your Company Address';
    const companyGST = document.getElementById('companyGST').value || 'GSTIN/UIN: XXXXXX';
    const companyPAN = document.getElementById('companyPAN').value || 'PAN: XXXXXX';
    const companyStateSelect = document.getElementById('companyState');
    const companyState = companyStateSelect.options[companyStateSelect.selectedIndex]?.text || 'State: XX';
    const companyStateCode = companyStateSelect.value || '';
    const companyEmail = document.getElementById('companyEmail').value || 'Email: your@email.com';
    const companyPhone = document.getElementById('companyPhone').value || 'Phone: +XX XXXXXXX';
    
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientAddress = document.getElementById('clientAddress').value || 'Client Address';
    const clientGST = document.getElementById('clientGST').value || 'GSTIN/UIN: XXXXXX';
    const clientPAN = document.getElementById('clientPAN').value || 'PAN: XXXXXX';
    const clientStateSelect = document.getElementById('clientState');
    const clientState = clientStateSelect.options[clientStateSelect.selectedIndex]?.text || 'State: XX';
    const clientStateCode = clientStateSelect.value || '';
    const placeOfSupply = document.getElementById('placeOfSupply').value || 'Place of Supply: XX';
    
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const formattedDate = invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : 'DD/MM/YYYY';
    
    const bankName = document.getElementById('bankName').value || 'Bank Name';
    const accountName = document.getElementById('accountName').value || 'Account Name';
    const accountNumber = document.getElementById('accountNumber').value || 'XXXXXXXXXXXX';
    const ifscCode = document.getElementById('ifscCode').value || 'IFSC: XXXXXX';
    const branchName = document.getElementById('branchName').value || 'Branch Name';
    const upiId = document.getElementById('upiId').value || '';
    
    const additionalNotes = document.getElementById('additionalNotes').value || '';
    
    const shippingAmount = document.getElementById('shippingAmount').value || 0;
    const discountAmount = document.getElementById('discountAmount').value || 0;
    const discountType = document.getElementById('discountType').value || 'fixed';
    const shippingTaxable = document.getElementById('shippingTaxable').value || 'yes';
    
    let items = [];
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-desc').value || 'Goods/Services';
        const hsn = row.querySelector('.item-hsn-code').value || 'XXXXXX';
        const rate = parseFloat(row.querySelector('.item-rate-value').value) || 0;
        const quantity = parseInt(row.querySelector('.item-quantity-value').value) || 1;
        const gstRateSelect = row.querySelector('.item-gst-rate');
        const gstRate = gstRateSelect.value;
        
        const amount = rate * quantity;
        
        items.push({
            description,
            hsn,
            rate,
            quantity,
            gstRate,
            amount
        });
    });
    console.log('Collected Items:', JSON.stringify(items, null, 2)); // DEBUGGING LINE
    
    const gstDetails = calculateGST(
        items, 
        companyStateCode, 
        clientStateCode, 
        shippingAmount, 
        discountAmount, 
        discountType, 
        shippingTaxable
    );
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('₹', '₹ ');
    };
    
    
    
    let qrCodeHTML = '';
    if (upiId) {
        qrCodeHTML = `
            <div class="qr-code">
                <div class="qr-code-container" id="qrCodeContainer"></div>
                <p>Scan to pay via UPI</p>
            </div>
        `;
    }
    
    // Calculate HSN-wise tax summary
    const hsnGroups = groupItemsByHSN(items);
    console.log('HSN Groups:', JSON.stringify(hsnGroups, null, 2)); // DEBUGGING LINE
    const isInterstate = companyStateCode !== clientStateCode;
    
    let taxSummaryHTML = `
        <table class="tax-summary">
            <thead>
                <tr>
                    <th>HSN/SAC</th>
                    <th>Taxable Value</th>
                    ${isInterstate ? '<th>IGST</th>' : '<th>CGST</th><th>SGST/UTGST</th>'}
                    <th>Total Tax</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.entries(hsnGroups).forEach(([hsn, group]) => {
        const gstRate = parseFloat(group.gstRate) || 0;
        const gstAmount = group.taxableValue * (gstRate / 100);
        
        if (isInterstate) {
            group.igst = gstAmount;
        } else {
            group.cgst = gstAmount / 2;
            group.sgst = gstAmount / 2;
        }
        
        taxSummaryHTML += `
            <tr>
                <td>${hsn}</td>
                <td>${formatCurrency(group.taxableValue)}</td>
                ${isInterstate ?
                    `<td>${formatCurrency(group.igst)} (${gstRate}%)</td>` :
                    `<td>${formatCurrency(group.cgst)} (${gstRate/2}%)</td>
                     <td>${formatCurrency(group.sgst)} (${gstRate/2}%)</td>`
                }
                <td>${formatCurrency(gstAmount)}</td>
            </tr>
        `;
    });
    
    taxSummaryHTML += `
            <tr>
                <th colspan="${isInterstate ? '3' : '4'}">Total</th>
                <th>${formatCurrency(gstDetails.totalTax)}</th>
            </tr>
        </tbody>
    </table>
    `;
    
    preview.innerHTML = `
        <div class="preview-header">
            <div class="company-info">
                
                <h2>${companyName}</h2>
                <div class="address">${companyAddress.replace(/\n/g, '<br>')}</div>
                <div>${companyGST} | ${companyPAN}</div>
                <div>${companyState} (${companyStateCode})</div>
                <div>${companyEmail} | ${companyPhone}</div>
            </div>
            <div class="invoice-meta">
                <h3>TAX INVOICE</h3>
                <div class="invoice-number">Invoice No: ${invoiceNumber}</div>
                <div class="invoice-date">Date: ${formattedDate}</div>
                ${logoHTML}
            </div>
        </div>
        
        <div class="preview-body">
            <div class="buyer-info">
                <h4>Buyer (Bill to)</h4>
                <div class="address">
                    <strong>${clientName}</strong><br>
                    ${clientAddress.replace(/\n/g, '<br>')}<br>
                    ${clientGST} | ${clientPAN}<br>
                    ${clientState} (${clientStateCode})<br>
                    ${placeOfSupply}
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Sl No.</th>
                        <th>Description</th>
                        <th>HSN/SAC</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>GST Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.description}</td>
                            <td>${item.hsn}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.rate)}</td>
                            <td>${item.gstRate}%</td>
                            <td>${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="calculation-details">
                <div class="calculation-row">
                    <span>Sub Total:</span>
                    <span>${formatCurrency(gstDetails.originalAmount)}</span>
                </div>
                ${parseFloat(discountAmount) > 0 ? `
                <div class="calculation-row">
                    <span>Discount ${discountType === 'percentage' ? `(${discountAmount}%)` : ''}:</span>
                    <span>- ${formatCurrency(gstDetails.discountValue)}</span>
                </div>` : ''}
                ${parseFloat(shippingAmount) > 0 ? `
                <div class="calculation-row">
                    <span>Shipping ${shippingTaxable === 'yes' ? '(Taxable)' : ''}:</span>
                    <span>+ ${formatCurrency(parseFloat(shippingAmount))}</span>
                </div>` : ''}
                <div class="calculation-row">
                    <span>Taxable Amount:</span>
                    <span>${formatCurrency(gstDetails.taxableValue)}</span>
                </div>
                ${gstDetails.isInterstate ? `
                <div class="calculation-row">
                    <span>IGST (${items[0]?.gstRate || 0}%):</span>
                    <span>${formatCurrency(gstDetails.totalIGST)}</span>
                </div>` : `
                <div class="calculation-row">
                    <span>CGST (${(items[0]?.gstRate || 0)/2}%):</span>
                    <span>${formatCurrency(gstDetails.totalCGST)}</span>
                </div>
                <div class="calculation-row">
                    <span>SGST (${(items[0]?.gstRate || 0)/2}%):</span>
                    <span>${formatCurrency(gstDetails.totalSGST)}</span>
                </div>`}
                <div class="calculation-row grand-total">
                    <span>Grand Total:</span>
                    <span>${formatCurrency(gstDetails.grandTotal)}</span>
                </div>
            </div>
            
            ${taxSummaryHTML}
            
            <div class="total-amount">
                <strong>Amount Chargeable (in words):</strong><br>
                <span class="preview-total-amount">${numberToWords(gstDetails.grandTotal)} Only</span>
            </div>
            
             <div class="bank-qr-container"> 
                <div class="bank-details"> 
                    <h4>Company's Bank Details</h4>
                    <div class="address">
                        <strong>A/c Holder's Name:</strong> ${accountName}<br>
                        <strong>Bank Name:</strong> ${bankName}<br>
                        <strong>A/c No.:</strong> ${accountNumber}<br>
                        <strong>Branch & IFS Code:</strong> ${branchName} & ${ifscCode}
                    </div>
                </div>

                ${qrCodeHTML} 

            </div>
            
            ${additionalNotes ? `
                <div class="additional-notes">
                    <h4>Additional Notes</h4>
                    <p>${additionalNotes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
           
            
            <div class="signature">
                <p>Authorised Seal & Signatory</p>
            </div>
        </div>
         <div class="footer-note">
                <p>QUIK INVOICE</p>
            </div>
    `;
    
    if (upiId && typeof QRCode !== 'undefined') {
        const container = document.getElementById('qrCodeContainer');
        if (container) {
            container.innerHTML = '';
            new QRCode(container, {
                text: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${gstDetails.grandTotal}&cu=INR`,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}