import { INDIAN_STATES } from './src/constants/states.js';
import { initThemeManager } from './src/utils/themeManager.js';
import { createItemRowTemplate } from './src/components/itemRow.js';
import { updatePreview } from './invoice-preview.js';
import { generatePDF } from './src/utils/pdfGenerator.js';


function initStateDropdowns() {
    const stateDropdowns = document.querySelectorAll('.state-dropdown');
    
    stateDropdowns.forEach(dropdown => {
       
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a State --';
        dropdown.appendChild(defaultOption);
        
       
        INDIAN_STATES.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = state.name;
            dropdown.appendChild(option);
        });
    });
}


function initLogoUpload() {
    const logoInput = document.getElementById('companyLogo');
    const logoPreview = document.getElementById('logoPreview');
    
    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoPreview.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}


function initFormElements() {
   
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsContainer = document.getElementById('itemsContainer');
    
    if (addItemBtn && itemsContainer) {
        addItemBtn.addEventListener('click', function() {
            const newItemRow = createItemRowTemplate();
            itemsContainer.appendChild(newItemRow);
            updatePreview();
        });
        
        
        if (itemsContainer.children.length === 0) {
            const newItemRow = createItemRowTemplate();
            itemsContainer.appendChild(newItemRow);
        }
    }
    
    
    document.querySelectorAll('input, textarea, select').forEach(element => {
        element.addEventListener('input', updatePreview);
        element.addEventListener('change', updatePreview);
    });
    
    
    document.addEventListener('itemsChanged', updatePreview);
    
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
                
                document.querySelectorAll('input, textarea, select').forEach(element => {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        element.checked = false;
                    } else if (element.tagName === 'SELECT') {
                        element.selectedIndex = 0;
                    } else {
                        element.value = '';
                    }
                });
                
                
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.innerHTML = '';
                }
                
                
                const itemsContainer = document.getElementById('itemsContainer');
                if (itemsContainer) {
                    itemsContainer.innerHTML = '';
                    const newItemRow = createItemRowTemplate();
                    itemsContainer.appendChild(newItemRow);
                }
                
                
                const invoiceDate = document.getElementById('invoiceDate');
                if (invoiceDate) {
                    invoiceDate.valueAsDate = new Date();
                }
                
                
                updatePreview();
            }
        });
    }
}


function initPDFGeneration() {
    const pdfBtn = document.getElementById('generatePdfBtn');
    const invoicePreview = document.getElementById('invoicePreview');
    
    if (pdfBtn && invoicePreview) {
        pdfBtn.addEventListener('click', async function() {
            
            pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            pdfBtn.disabled = true;
            
            try {
                const success = await generatePDF(invoicePreview);
                
                if (success) {
                    
                    pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
                    pdfBtn.disabled = false;
                } else {
                   
                    pdfBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed - Try Again';
                    pdfBtn.disabled = false;
                    
                    setTimeout(() => {
                        pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
                    }, 3000);
                }
            } catch (error) {
                console.error("Error generating PDF:", error);
                pdfBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed - Try Again';
                pdfBtn.disabled = false;
                
                setTimeout(() => {
                    pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
                }, 3000);
            }
        });
    }
}


function initPrintButton() {
    const printBtn = document.getElementById('printInvoiceBtn');
    
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
}


function initWhatsAppSharing() {
    const shareBtn = document.getElementById('shareWhatsappBtn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'Invoice';
            const clientName = document.getElementById('clientName').value || 'Client';
            
            const message = `Hello! Here is your ${invoiceNumber} from Quik Invoice. Please find the attached PDF.`;
            
           
            document.getElementById('generatePdfBtn').click();
            
            
            setTimeout(() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
            }, 2000);
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
    
    initThemeManager();
    
    
    initStateDropdowns();
    
    
    initLogoUpload();
    
   
    initFormElements();
    
    
    initPDFGeneration();
    initPrintButton();
    initWhatsAppSharing();
    
   
    const invoiceDate = document.getElementById('invoiceDate');
    if (invoiceDate) {
        invoiceDate.valueAsDate = new Date();
    }
    
   
    updatePreview();
});