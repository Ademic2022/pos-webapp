import React, { useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  DollarSign,
} from "lucide-react";

interface ReturnRequest {
  id: string;
  originalTransactionId: string;
  customerId: number;
  customerName: string;
  originalDate: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "processed";
  reason: string;
  returnItems: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalRefundAmount: number;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

interface ProcessReturnModalProps {
  show: boolean;
  returnRequest: ReturnRequest | null;
  onClose: () => void;
  onProcess: (decision: "approved" | "rejected", notes?: string) => void;
}

const ProcessReturnModal: React.FC<ProcessReturnModalProps> = ({
  show,
  returnRequest,
  onClose,
  onProcess,
}) => {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null
  );
  const [processingNotes, setProcessingNotes] = useState("");
  const [refundMethod, setRefundMethod] = useState<
    "cash" | "credit" | "transfer"
  >("credit");
  const [partialRefund, setPartialRefund] = useState(false);
  const [partialAmount, setPartialAmount] = useState(0);

  const handleProcess = () => {
    if (!decision || !returnRequest) return;

    // In a real app, you would:
    // 1. Update the return status in the database
    // 2. If approved:
    //    - Process refund based on method
    //    - Update customer balance
    //    - Restore stock quantities
    //    - Create return transaction record
    // 3. Send notification to customer
    // 4. Generate return receipt

    console.log("Processing return:", {
      returnId: returnRequest.id,
      decision,
      refundMethod,
      refundAmount: partialRefund
        ? partialAmount
        : returnRequest.totalRefundAmount,
      notes: processingNotes,
      processedBy: "Admin", // In real app, use authenticated user
      processedDate: new Date().toISOString(),
    });

    onProcess(decision, processingNotes);
    resetForm();
  };

  const resetForm = () => {
    setDecision(null);
    setProcessingNotes("");
    setRefundMethod("credit");
    setPartialRefund(false);
    setPartialAmount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show || !returnRequest) return null;

  const finalRefundAmount = partialRefund
    ? partialAmount
    : returnRequest.totalRefundAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Process Return Request
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve/reject return ID: {returnRequest.id}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Return Details Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Return Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Customer:</span>
                <span className="ml-2 font-medium">
                  {returnRequest.customerName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Original Transaction:</span>
                <span className="ml-2 font-medium">
                  {returnRequest.originalTransactionId}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Request Date:</span>
                <span className="ml-2 font-medium">
                  {new Date(returnRequest.requestDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Original Date:</span>
                <span className="ml-2 font-medium">
                  {new Date(returnRequest.originalDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Return Reason</h4>
            <p className="text-gray-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              {returnRequest.reason}
            </p>
            {returnRequest.notes && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700 mb-1">
                  Customer Notes
                </h5>
                <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">
                  {returnRequest.notes}
                </p>
              </div>
            )}
          </div>

          {/* Return Items */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Items to Return</h4>
            <div className="space-y-2">
              {returnRequest.returnItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₦
                        {item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ₦{item.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Refund Amount:</span>
                <span className="text-orange-600">
                  ₦{returnRequest.totalRefundAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Decision Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Processing Decision
            </h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setDecision("approved")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  decision === "approved"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Approve Return</span>
                </div>
                <p className="text-sm mt-1 opacity-75">
                  Accept return and process refund
                </p>
              </button>

              <button
                onClick={() => setDecision("rejected")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  decision === "rejected"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <XCircle className="w-6 h-6" />
                  <span className="font-medium">Reject Return</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Deny return request</p>
              </button>
            </div>

            {/* Approval Options */}
            {decision === "approved" && (
              <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800">
                  Refund Processing Options
                </h5>

                {/* Partial Refund Option */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="partialRefund"
                    checked={partialRefund}
                    onChange={(e) => setPartialRefund(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="partialRefund"
                    className="text-sm font-medium text-green-700"
                  >
                    Partial refund (different amount)
                  </label>
                </div>

                {partialRefund && (
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Refund Amount (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={returnRequest.totalRefundAmount}
                      value={partialAmount}
                      onChange={(e) =>
                        setPartialAmount(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Enter refund amount"
                    />
                  </div>
                )}

                {/* Refund Method */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Refund Method
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) =>
                      setRefundMethod(
                        e.target.value as "cash" | "credit" | "transfer"
                      )
                    }
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="credit">
                      Add to Customer Credit Balance
                    </option>
                    <option value="cash">Cash Refund</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* Refund Summary */}
                <div className="bg-white border border-green-300 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Refund Summary
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Amount:</span>
                      <span className="font-medium">
                        ₦{finalRefundAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Method:</span>
                      <span className="font-medium capitalize">
                        {refundMethod}
                      </span>
                    </div>
                    {refundMethod === "credit" && (
                      <div className="text-xs text-green-600 mt-1">
                        Amount will be added to customer&apos;s credit balance
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Processing Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Notes{" "}
                {decision === "rejected" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={
                  decision === "approved"
                    ? "Add any notes about the refund processing..."
                    : decision === "rejected"
                    ? "Explain why the return is being rejected..."
                    : "Add processing notes..."
                }
                required={decision === "rejected"}
              />
            </div>

            {/* Warning for rejection */}
            {decision === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Rejecting this return will notify the customer with your
                    reason.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            disabled={
              !decision ||
              (decision === "rejected" && !processingNotes.trim()) ||
              (decision === "approved" && partialRefund && partialAmount <= 0)
            }
            className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              decision === "approved"
                ? "bg-green-600 text-white hover:bg-green-700"
                : decision === "rejected"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-400 text-white"
            }`}
          >
            {decision === "approved"
              ? "Approve & Process Refund"
              : decision === "rejected"
              ? "Reject Return"
              : "Select Decision"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessReturnModal;
