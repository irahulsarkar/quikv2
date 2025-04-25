
export function generatePDF(element) {
    
    const clone = element.cloneNode(true);
    
    
    
    
    Array.from(clone.querySelectorAll('img')).forEach(img => {
        if (img.src) {
            img.crossOrigin = 'Anonymous';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        }
    });
    
    
    
  
    
 
    const opt = {
        margin: 15, // 15mm margins
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };
    
   
    const container = document.createElement('div');
    container.style.visibility = 'hidden';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.appendChild(clone);
    document.body.appendChild(container);
    
    return html2pdf()
        .from(clone)
        .set(opt)
        .save()
        .then(() => {
            document.body.removeChild(container);
            return true;
        })
        .catch(error => {
            console.error('PDF generation failed:', error);
            document.body.removeChild(container);
            return false;
        });
}