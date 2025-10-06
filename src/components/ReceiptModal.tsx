import React from 'react';
import { X, Printer, Download, Store, Phone, Mail, MapPin } from 'lucide-react';
import { Sale } from '../types';
import Modal from './Modal';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  storeName?: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  sale, 
  onClose, 
  onPrint, 
  onDownload, 
  storeName = 'Parampara Naturals',
  storePhone = '+91 98765 43210',
  storeEmail = 'info@paramparanaturals.com',
  storeAddress = '123 Green Street, Organic City, India - 110001'
}) => {
  if (!sale) return null;

  const subtotal = sale.items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
  const discount = sale.discount || 0;
  const tax = sale.tax || 0;
  const total = subtotal - discount + tax;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Generate PDF receipt
      generatePDFReceipt();
    }
  };

  const generatePDFReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    // Helper function to add a new page if needed
    const addPageIfNeeded = (contentHeight: number) => {
      if (yPosition + contentHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Helper function to add text with proper formatting
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const maxWidth = pageWidth - x - margin;
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, options);
      return y + (lines.length * (options.fontSize || 10) * 0.35);
    };

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, options: any = {}) => {
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y, options);
      return y + (options.fontSize || 10) * 0.35;
    };

    // Helper function to add right-aligned text
    const addRightText = (text: string, y: number, options: any = {}) => {
      const textWidth = doc.getTextWidth(text);
      const x = pageWidth - margin - textWidth;
      doc.text(text, x, y, options);
      return y + (options.fontSize || 10) * 0.35;
    };
    
    // Helper function to wrap long text
    const wrapText = (text: string, maxWidth: number, maxLines: number = 2) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      if (lines.length > maxLines) {
        return lines.slice(0, maxLines - 1).join(' ') + '...';
      }
      return text;
    };

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return `Rs. ${amount.toFixed(2)}`;
    };

    // Helper function to format date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Header with better styling
    doc.setFillColor(34, 139, 34); // Green background
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    yPosition = addCenteredText(storeName.toUpperCase(), 15, { fontSize: 18 });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    yPosition = addCenteredText('Organic & Natural Products', 20, { fontSize: 9 });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPosition = 35;

    // Contact info with better formatting
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    yPosition = addCenteredText(`${storePhone} | ${storeEmail}`, yPosition, { fontSize: 8 });
    yPosition = addCenteredText(storeAddress, yPosition, { fontSize: 8 });
    yPosition += 8;

    // Double separator line
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Receipt details with better layout
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Receipt number and date in a box
    const receiptNumber = `Receipt #: ${sale.receiptId || sale.id}`;
    const receiptDate = `Date: ${formatDate(sale.date)}`;
    
    // Create a subtle background for receipt info
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 12, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(receiptNumber, margin + 3, yPosition + 2);
    doc.text(receiptDate, pageWidth - margin - doc.getTextWidth(receiptDate) - 3, yPosition + 2);
    yPosition += 15;

    // Customer info with better formatting
    if (sale.customer) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${sale.customer.name}`, margin, yPosition);
      yPosition += 5;
      
      if (sale.customer.phone) {
        doc.text(`Phone: ${sale.customer.phone}`, margin, yPosition);
        yPosition += 5;
      }
      
      if (sale.customer.email) {
        doc.text(`Email: ${sale.customer.email}`, margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 8;
    }

    // Items section with optimized layout
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEMS PURCHASED', margin, yPosition);
    yPosition += 8;

    // Table header with background
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Name', margin + 2, yPosition + 2);
    doc.text('Qty', margin + 100, yPosition + 2);
    doc.text('Rate', margin + 120, yPosition + 2);
    doc.text('Amount', pageWidth - margin - 25, yPosition + 2);
    yPosition += 10;

    // Items with compact layout
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    sale.items.forEach((item, index) => {
      // Compact item height - only add page break if absolutely necessary
      const itemHeight = 8; // Reduced height
      
      // Only check for page break if we're really close to the bottom
      if (yPosition + itemHeight > pageHeight - 30) { // Leave more space at bottom
        doc.addPage();
        yPosition = margin;
        
        // Re-add table header on new page
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Item Name', margin + 2, yPosition + 2);
        doc.text('Qty', margin + 100, yPosition + 2);
        doc.text('Rate', margin + 120, yPosition + 2);
        doc.text('Amount', pageWidth - margin - 25, yPosition + 2);
        yPosition += 10;
      }
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, itemHeight - 1, 'F');
      }
      
      // Item name with truncation for long names
      const itemNameWidth = 80;
      const itemName = item.productName.length > 25 ? 
        item.productName.substring(0, 22) + '...' : 
        item.productName;
      
      doc.text(itemName, margin + 2, yPosition + 2);
      
      // Quantity
      doc.text(item.quantity.toString(), margin + 100, yPosition + 2);
      
      // Price
      doc.text(formatCurrency(item.price), margin + 120, yPosition + 2);
      
      // Total
      const itemTotal = item.total || item.price * item.quantity;
      doc.text(formatCurrency(itemTotal), pageWidth - margin - doc.getTextWidth(formatCurrency(itemTotal)) - 2, yPosition + 2);
      
      yPosition += itemHeight;
    });

    yPosition += 6;

    // Totals section with compact formatting
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', pageWidth - margin - 60, yPosition);
    doc.text(formatCurrency(subtotal), pageWidth - margin - 5, yPosition);
    yPosition += 5;

    // Discount
    if (discount > 0) {
      doc.text('Discount:', pageWidth - margin - 60, yPosition);
      doc.text(`-${formatCurrency(discount)}`, pageWidth - margin - 5, yPosition);
      yPosition += 5;
    }

    // Tax
    if (tax > 0) {
      doc.text('Tax:', pageWidth - margin - 60, yPosition);
      doc.text(formatCurrency(tax), pageWidth - margin - 5, yPosition);
      yPosition += 5;
    }

    // Total with emphasis
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 60, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 3;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', pageWidth - margin - 60, yPosition);
    doc.text(formatCurrency(total), pageWidth - margin - 5, yPosition);
    yPosition += 8;

    // Payment method
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${sale.paymentMethod.toUpperCase()}`, margin, yPosition);
    yPosition += 5;

    // Cash payment details (compact)
    if (sale.paymentMethod === 'cash' && sale.cashReceived && sale.changeGiven !== undefined) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('CASH DETAILS:', margin, yPosition);
      yPosition += 4;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Received: ${formatCurrency(sale.cashReceived)}`, margin, yPosition);
      yPosition += 3;
      doc.text(`Change: ${formatCurrency(sale.changeGiven)}`, margin, yPosition);
      yPosition += 6;
    } else {
      yPosition += 6;
    }

    // Compact footer
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    yPosition = addCenteredText('Thank you for your business!', yPosition, { fontSize: 7 });
    yPosition = addCenteredText('Visit us again for fresh organic products', yPosition, { fontSize: 7 });
    yPosition += 3;
    yPosition = addCenteredText('Computer generated receipt', yPosition, { fontSize: 6 });

    // Save the PDF with better filename
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`Receipt_${sale.receiptId || sale.id}_${timestamp}.pdf`);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Receipt" size="lg">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="receipt-content space-y-6">
        {/* Receipt Header */}
        <div className="text-center border-b border-border/30 dark:border-border-dark/30 pb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Store className="h-8 w-8 text-primary dark:text-primary-dark" />
            <h2 className="text-2xl font-bold text-text dark:text-text-dark">{storeName}</h2>
          </div>
          <p className="text-text-secondary dark:text-text-secondary-dark">Organic & Natural Products</p>
          <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>{storePhone}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{storeEmail}</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-1 mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            <MapPin className="h-4 w-4" />
            <span>{storeAddress}</span>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Receipt #</p>
              <p className="font-mono font-semibold text-text dark:text-text-dark">
                {sale.receiptId || sale.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Date & Time</p>
              <p className="font-semibold text-text dark:text-text-dark">
                {sale.date.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-secondary/30 dark:bg-secondary-dark/30 rounded-lg p-4">
            <h3 className="font-semibold text-text dark:text-text-dark mb-2">Customer Details</h3>
            <div className="space-y-1">
              <p className="text-text dark:text-text-dark">
                <span className="font-medium">Name:</span> {sale.customer?.name || 'Walk-in Customer'}
              </p>
              {sale.customer?.phone && (
                <p className="text-text dark:text-text-dark">
                  <span className="font-medium">Phone:</span> {sale.customer.phone}
                </p>
              )}
              {sale.customer?.email && (
                <p className="text-text dark:text-text-dark">
                  <span className="font-medium">Email:</span> {sale.customer.email}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h3 className="font-semibold text-text dark:text-text-dark">Items</h3>
            <div className="border border-border/30 dark:border-border-dark/30 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/50 dark:bg-secondary-dark/50">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-medium text-text dark:text-text-dark">Item</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-text dark:text-text-dark">Qty</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-text dark:text-text-dark">Price</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-text dark:text-text-dark">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => (
                    <tr key={index} className="border-t border-border/30 dark:border-border-dark/30">
                      <td className="py-2 px-3 text-sm text-text dark:text-text-dark">{item.productName}</td>
                      <td className="py-2 px-3 text-center text-sm text-text dark:text-text-dark">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-sm text-text dark:text-text-dark">₹{item.price}</td>
                      <td className="py-2 px-3 text-right text-sm font-medium text-text dark:text-text-dark">
                        ₹{item.total || item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal</span>
              <span className="text-text dark:text-text-dark">₹{subtotal.toLocaleString()}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Discount</span>
                <span className="text-green-600 dark:text-green-400">-₹{discount.toLocaleString()}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary dark:text-text-secondary-dark">Tax</span>
                <span className="text-text dark:text-text-dark">₹{tax.toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t border-border/30 dark:border-border-dark/30 pt-1">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-text dark:text-text-dark">Total</span>
                <span className="text-primary dark:text-primary-dark">₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary dark:text-text-secondary-dark">Payment Method</span>
              <span className="text-text dark:text-text-dark capitalize">{sale.paymentMethod}</span>
            </div>
            
            {/* Cash Payment Details */}
            {sale.paymentMethod === 'cash' && sale.cashReceived && sale.changeGiven !== undefined && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm mb-2">Cash Payment Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">Cash Received</span>
                    <span className="font-medium text-green-800 dark:text-green-200">₹{sale.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700 dark:text-green-300">Change Given</span>
                    <span className="font-medium text-green-800 dark:text-green-200">₹{sale.changeGiven.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-text-secondary dark:text-text-secondary-dark border-t border-border/30 dark:border-border-dark/30 pt-4">
          <p>Thank you for your business!</p>
          <p>Visit us again for fresh organic products</p>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex justify-end space-x-3 pt-4">
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center space-x-2 px-4 py-2"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center space-x-2 px-4 py-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};


export default ReceiptModal;
