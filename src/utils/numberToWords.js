
export function numberToWords(num) {
    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    let str = '';
    let rupees = Math.floor(num);
    let paise = Math.round((num - rupees) * 100);
    
    if (rupees > 0) {
        str += convertNumber(rupees) + ' Rupees';
    }
    if (paise > 0) {
        if (str !== '') str += ' and ';
        str += convertNumber(paise) + ' Paise';
    }
    return str || 'Zero Rupees';
    
    function convertNumber(num) {
        if (num === 0) return 'Zero';
        
        let str = '';
        let crore = Math.floor(num / 10000000) % 100;
        if (crore > 0) {
            str += (crore > 9 ? convertNumber(crore) : single[crore]) + ' Crore';
        }
        
        let lakh = Math.floor(num / 100000) % 100;
        if (lakh > 0) {
            if (str !== '') str += ' ';
            str += (lakh > 9 ? convertNumber(lakh) : single[lakh]) + ' Lakh';
        }
        
        let thousand = Math.floor(num / 1000) % 100;
        if (thousand > 0) {
            if (str !== '') str += ' ';
            str += (thousand > 9 ? convertNumber(thousand) : single[thousand]) + ' Thousand';
        }
        
        let hundred = Math.floor(num / 100) % 10;
        if (hundred > 0) {
            if (str !== '') str += ' ';
            str += single[hundred] + ' Hundred';
        }
        
        let remaining = num % 100;
        if (remaining > 0) {
            if (str !== '') str += ' and ';
            
            if (remaining < 10) {
                str += single[remaining];
            } else if (remaining >= 10 && remaining < 20) {
                str += double[remaining - 10];
            } else {
                str += tens[Math.floor(remaining / 10)];
                if (remaining % 10 > 0) {
                    str += ' ' + single[remaining % 10];
                }
            }
        }
        
        return str;
    }
}