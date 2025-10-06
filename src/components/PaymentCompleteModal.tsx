import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import Modal from './Modal';

interface PaymentCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sale: {
    id: string;
    receiptId?: string;
    customer?: { name?: string; phone?: string };
    total: number;
    paidAmount?: number;
    remainingAmount?: number;
    status: string;
  };
}

const PaymentCompleteModal: React.FC<PaymentCompleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sale
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error completing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPartialPayment = sale.status === 'partial';
  const paidAmount = sale.paidAmount || 0;
  // Calculate remaining amount if not provided or if it seems incorrect
  const calculatedRemaining = sale.total - paidAmount;
  const remainingAmount = (sale.remainingAmount && sale.remainingAmount > 0) ? sale.remainingAmount : calculatedRemaining;
  const amountToPay = isPartialPayment ? remainingAmount : sale.total;
  
  // Debug logging
  console.log('PaymentCompleteModal - Sale data:', {
    status: sale.status,
    total: sale.total,
    paidAmount,
    remainingAmount,
    isPartialPayment
  });

  const getModalTitle = () => {
    if (isPartialPayment) {
      return "Complete Partial Payment";
    } else if (sale.status === 'pending') {
      return "Complete Pending Payment";
    }
    return "Complete Payment";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="md">
      <div className="space-y-6">
        {/* Sale Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sale #{sale.receiptId || sale.id}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sale.customer?.name || 'Walk-in Customer'}
                {sale.customer?.phone && ` • ${sale.customer.phone}`}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isPartialPayment 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : sale.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {isPartialPayment ? 'Partial Payment' : sale.status === 'pending' ? 'Pending Payment' : 'Payment'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Payment Summary
            </h4>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
              <span className="font-semibold">₹{sale.total.toFixed(2)}</span>
            </div>

            {isPartialPayment && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Already Paid:</span>
                  <span className="text-green-600 font-semibold">₹{paidAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <span className="font-semibold text-blue-600">₹{remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
                {paidAmount === 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ No partial payment data found. This might be an older sale.
                  </div>
                )}
              </>
            )}

            {!isPartialPayment && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount to Pay:</span>
                  <span className="font-semibold text-blue-600">₹{amountToPay.toFixed(2)}</span>
                </div>
                {sale.status === 'pending' && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    💡 This is a pending sale - customer will pay the full amount now.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                {isPartialPayment ? 'Complete Partial Payment' : 'Complete Pending Payment'}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {isPartialPayment 
                  ? `This will mark the remaining ₹${remainingAmount.toFixed(2)} as paid and complete the sale.`
                  : `This will mark the full amount of ₹${sale.total.toFixed(2)} as paid and complete the sale.`
                } This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{isPartialPayment ? 'Complete Payment' : 'Mark as Paid'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentCompleteModal;
