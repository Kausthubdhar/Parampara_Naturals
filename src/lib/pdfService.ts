import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Sale, Customer } from '../types';

export interface PDFReceiptConfig {
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  businessLocation?: string;
}

export class PDFService {
  private static instance: PDFService;
  private config: PDFReceiptConfig;

  constructor(config: PDFReceiptConfig) {
    this.config = config;
  }

  static getInstance(config?: PDFReceiptConfig): PDFService {
    if (!PDFService.instance && config) {
      PDFService.instance = new PDFService(config);
    }
    return PDFService.instance;
  }

  async generateReceiptPDF(sale: Sale, customer?: Customer): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container for the receipt
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '400px';
        document.body.appendChild(tempContainer);

        // Create the receipt HTML
        const receiptHTML = this.createReceiptHTML(sale, customer);
        tempContainer.innerHTML = receiptHTML;

        // Convert to canvas and then to PDF
        html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // Calculate dimensions
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 295; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add additional pages if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Clean up
          document.body.removeChild(tempContainer);

          // Convert to blob
          const pdfBlob = pdf.output('blob');
          resolve(pdfBlob);
        }).catch(error => {
          document.body.removeChild(tempContainer);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private createReceiptHTML(sale: Sale, customer?: Customer): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const generateReceiptId = (sale: Sale) => {
      return sale.receiptId || sale.id;
    };

    return `
      <div style="
        width: 400px;
        background-color: white;
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 20px;
        color: #333;
        font-size: 14px;
        line-height: 1.4;
        box-sizing: border-box;
      ">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 30px;">
          <!-- Logo -->
          <div style="
            width: 60px;
            height: 60px;
            background-color: #22c55e;
            border-radius: 8px;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          ">
            🏪
          </div>
          
          <!-- Business Name -->
          <h1 style="
            font-size: 22px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 8px 0;
            letter-spacing: 0.5px;
          ">
            ${this.config.businessName}
          </h1>
          
          <!-- Tagline -->
          <p style="
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 20px 0;
          ">
            Organic & Natural Products
          </p>
          
          <!-- Contact Information -->
          <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 10px;">
            ${this.config.businessPhone ? `
              <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280;">
                <span>📞</span>
                <span>${this.config.businessPhone}</span>
              </div>
            ` : ''}
            ${this.config.businessEmail ? `
              <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280;">
                <span>✉️</span>
                <span>${this.config.businessEmail}</span>
              </div>
            ` : ''}
            ${this.config.businessLocation ? `
              <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280;">
                <span>📍</span>
                <span>${this.config.businessLocation}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Transaction Details -->
        <div style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        ">
          <div>
            <span style="font-size: 12px; color: #6b7280;">Receipt #</span>
            <div style="font-size: 16px; font-weight: bold; color: #1f2937;">
              ${generateReceiptId(sale)}
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 12px; color: #6b7280;">Date & Time</span>
            <div style="font-size: 16px; font-weight: bold; color: #1f2937;">
              ${formatDate(sale.date)}, ${formatTime(sale.date)}
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        ${customer ? `
          <div style="margin-bottom: 25px;">
            <h3 style="
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin: 0 0 10px 0;
            ">
              Customer Details
            </h3>
            <div style="font-size: 14px; color: #374151;">
              <div style="margin-bottom: 5px;">
                <strong>Name:</strong> ${customer.firstName} ${customer.lastName || ''}
              </div>
              <div>
                <strong>Phone:</strong> ${customer.phone}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Items Table -->
        <div style="margin-bottom: 25px;">
          <h3 style="
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 10px 0;
          ">
            Items
          </h3>
          
          <!-- Table Header -->
          <div style="
            background-color: #dcfce7;
            padding: 12px;
            border-radius: 6px 6px 0 0;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 10px;
            font-weight: bold;
            font-size: 14px;
            color: #166534;
          ">
            <div>Item</div>
            <div style="text-align: center;">Qty</div>
            <div style="text-align: right;">Price</div>
            <div style="text-align: right;">Total</div>
          </div>
          
          <!-- Table Body -->
          <div style="
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 6px 6px;
          ">
            ${sale.items.map((item, index) => `
              <div style="
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 10px;
                padding: 12px;
                border-bottom: ${index < sale.items.length - 1 ? '1px solid #f3f4f6' : 'none'};
                font-size: 14px;
                color: #374151;
              ">
                <div style="font-weight: 500;">${item.productName}</div>
                <div style="text-align: center;">${item.quantity}</div>
                <div style="text-align: right;">₹${item.price.toFixed(2)}</div>
                <div style="text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Summary Section -->
        <div style="margin-bottom: 25px;">
          <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            color: #6b7280;
          ">
            <span>Subtotal</span>
            <span>₹${sale.total.toFixed(2)}</span>
          </div>
          
          ${sale.discount && sale.discount > 0 ? `
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
              color: #6b7280;
            ">
              <span>Discount</span>
              <span>-₹${sale.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          
          ${sale.tax && sale.tax > 0 ? `
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
              color: #6b7280;
            ">
              <span>Tax</span>
              <span>₹${sale.tax.toFixed(2)}</span>
            </div>
          ` : ''}
          
          <div style="
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 2px solid #22c55e;
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
          ">
            <span>Total</span>
            <span style="color: #22c55e;">₹${sale.total.toFixed(2)}</span>
          </div>
          
          <div style="
            display: flex;
            justify-content: space-between;
            margin-top: 8px;
            font-size: 14px;
            color: #6b7280;
          ">
            <span>Payment Method</span>
            <span style="text-transform: capitalize; font-weight: 500;">${sale.paymentMethod}</span>
          </div>
        </div>

        <!-- Cash Payment Details -->
        ${sale.paymentMethod === 'cash' && (sale.cashReceived || sale.changeGiven) ? `
          <div style="
            background-color: #dcfce7;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #bbf7d0;
          ">
            <h4 style="
              font-size: 16px;
              font-weight: bold;
              color: #166534;
              margin: 0 0 10px 0;
            ">
              Cash Payment Details
            </h4>
            
            ${sale.cashReceived ? `
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
                color: #166534;
              ">
                <span>Cash Received</span>
                <span style="font-weight: bold;">₹${sale.cashReceived.toFixed(2)}</span>
              </div>
            ` : ''}
            
            ${sale.changeGiven ? `
              <div style="
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: #166534;
              ">
                <span>Change Given</span>
                <span style="font-weight: bold;">₹${sale.changeGiven.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        ">
          <p style="margin: 0 0 5px 0;">🙏 Thank you for shopping with us!</p>
          <p style="margin: 0;">📍 Visit us again soon!</p>
        </div>
      </div>
    `;
  }

  // Update configuration
  updateConfig(config: Partial<PDFReceiptConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  getConfig(): PDFReceiptConfig {
    return { ...this.config };
  }
}
