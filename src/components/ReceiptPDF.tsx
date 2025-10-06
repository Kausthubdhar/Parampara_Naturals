import React from 'react';
import { Sale, Customer } from '../types';

interface ReceiptPDFProps {
  sale: Sale;
  customer?: Customer;
  businessName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessLocation?: string;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  sale,
  customer,
  businessName = 'Parampara Naturals',
  businessPhone = '',
  businessEmail = '',
  businessLocation = ''
}) => {
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

  return (
    <div className="receipt-pdf" style={{
      width: '400px',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      margin: '0 auto',
      color: '#333'
    }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {/* Logo */}
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#22c55e',
          borderRadius: '8px',
          margin: '0 auto 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🏪
        </div>
        
        {/* Business Name */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 8px 0',
          letterSpacing: '0.5px'
        }}>
          {businessName}
        </h1>
        
        {/* Tagline */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 20px 0'
        }}>
          Organic & Natural Products
        </p>
        
        {/* Contact Information */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
          {businessPhone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
              <span>📞</span>
              <span>{businessPhone}</span>
            </div>
          )}
          {businessEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
              <span>✉️</span>
              <span>{businessEmail}</span>
            </div>
          )}
          {businessLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
              <span>📍</span>
              <span>{businessLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Receipt #</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
              {generateReceiptId(sale)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Date & Time</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            {formatDate(sale.date)}, {formatTime(sale.date)}
          </div>
        </div>
      </div>

      {/* Customer Details */}
      {customer && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            Customer Details
          </h3>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <div style={{ marginBottom: '5px' }}>
              <strong>Name:</strong> {customer.firstName} {customer.lastName || ''}
            </div>
            <div>
              <strong>Phone:</strong> {customer.phone}
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: '0 0 10px 0'
        }}>
          Items
        </h3>
        
        {/* Table Header */}
        <div style={{
          backgroundColor: '#dcfce7',
          padding: '12px',
          borderRadius: '6px 6px 0 0',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '10px',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#166534'
        }}>
          <div>Item</div>
          <div style={{ textAlign: 'center' }}>Qty</div>
          <div style={{ textAlign: 'right' }}>Price</div>
          <div style={{ textAlign: 'right' }}>Total</div>
        </div>
        
        {/* Table Body */}
        <div style={{
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px'
        }}>
          {sale.items.map((item, index) => (
            <div
              key={item.productId}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '10px',
                padding: '12px',
                borderBottom: index < sale.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '14px',
                color: '#374151'
              }}
            >
              <div style={{ fontWeight: '500' }}>{item.productName}</div>
              <div style={{ textAlign: 'center' }}>{item.quantity}</div>
              <div style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <span>Subtotal</span>
          <span>₹{sale.total.toFixed(2)}</span>
        </div>
        
        {sale.discount && sale.discount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span>Discount</span>
            <span>-₹{sale.discount.toFixed(2)}</span>
          </div>
        )}
        
        {sale.tax && sale.tax > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span>Tax</span>
            <span>₹{sale.tax.toFixed(2)}</span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '2px solid #22c55e',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          <span>Total</span>
          <span style={{ color: '#22c55e' }}>₹{sale.total.toFixed(2)}</span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <span>Payment Method</span>
          <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{sale.paymentMethod}</span>
        </div>
      </div>

      {/* Cash Payment Details */}
      {sale.paymentMethod === 'cash' && (sale.cashReceived || sale.changeGiven) && (
        <div style={{
          backgroundColor: '#dcfce7',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#166534',
            margin: '0 0 10px 0'
          }}>
            Cash Payment Details
          </h4>
          
          {sale.cashReceived && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#166534'
            }}>
              <span>Cash Received</span>
              <span style={{ fontWeight: 'bold' }}>₹{sale.cashReceived.toFixed(2)}</span>
            </div>
          )}
          
          {sale.changeGiven && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#166534'
            }}>
              <span>Change Given</span>
              <span style={{ fontWeight: 'bold' }}>₹{sale.changeGiven.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0 0 5px 0' }}>🙏 Thank you for shopping with us!</p>
        <p style={{ margin: '0' }}>📍 Visit us again soon!</p>
      </div>
    </div>
  );
};

export default ReceiptPDF;
