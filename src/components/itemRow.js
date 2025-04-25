
export function createItemRowTemplate() {
    const row = document.createElement('div');
    row.className = 'item-row';
    
    row.innerHTML = `
        <button class="remove-item"><i class="fas fa-times"></i></button>
        <div class="form-group">
            <label>Description</label>
            <input type="text" class="item-desc" placeholder="Description of goods or services">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>HSN/SAC Code</label>
                <input type="text" class="item-hsn-code" placeholder="HSN Code">
            </div>
            <div class="form-group">
                <label>GST Rate (%)</label>
                <select class="item-gst-rate">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="item-quantity-value" value="1" min="1" step="1">
            </div>
            <div class="form-group">
                <label>Rate (₹)</label>
                <input type="number" class="item-rate-value" value="0.00" min="0" step="0.01">
            </div>
        </div>
        <div class="form-group">
            <label>Amount</label>
            <div class="item-amount">₹ 0.00</div>
        </div>
    `;
    
    
    const quantityInput = row.querySelector('.item-quantity-value');
    const rateInput = row.querySelector('.item-rate-value');
    const amountDisplay = row.querySelector('.item-amount');
    
    const updateAmount = () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const amount = quantity * rate;
        
        amountDisplay.textContent = '₹ ' + amount.toFixed(2);
        
        
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    };
    
    quantityInput.addEventListener('input', updateAmount);
    rateInput.addEventListener('input', updateAmount);
    
    
    const removeButton = row.querySelector('.remove-item');
    removeButton.addEventListener('click', function() {
        row.remove();
       
        document.dispatchEvent(new Event('itemsChanged'));
    });
    
    return row;
}