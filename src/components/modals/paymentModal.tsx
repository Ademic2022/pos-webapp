import React from "react";
import { X } from "lucide-react";

interface Customer {
  name: string;
  balance: number;
}

interface PaymentModalProps {
  show: boolean;
  customer: Customer | null;
  paymentAmount: number;
  setPaymentAmount: (value: number) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentNote: string;
  setPaymentNote: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  customer,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  paymentNote,
  setPaymentNote,
  onClose,
  onSubmit,
}) => {
  if (!show || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Record Payment
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {customer.name} (Balance: ₦
            {Math.abs(customer.balance).toLocaleString()})
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (₦) *
            </label>
            <input
              type="number"
              value={paymentAmount || ""}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Enter amount"
              min={1}
              max={Math.abs(customer.balance)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
              <option value="card">Card Payment</option>
              <option value="pos">POS</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Any additional notes"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!paymentAmount || paymentAmount <= 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
