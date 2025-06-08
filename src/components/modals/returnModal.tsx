import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Package,
  AlertCircle,
  Receipt,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Customer, CustomerTransaction } from "@/interfaces/interface";
import {
  ReturnValidator,
  ReturnValidationContext,
  ReturnValidationResult,
} from "@/utils/returnValidator";

interface ReturnModalProps {
  show: boolean;
  onClose: () => void;
  customers: Customer[];
  customerTransactions: Record<number, CustomerTransaction[]>;
}

interface ReturnItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  maxQuantity: number;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  show,
  onClose,
  customers,
  customerTransactions,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<CustomerTransaction | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [step, setStep] = useState(1); // 1: Customer, 2: Transaction, 3: Items, 4: Review
  const [validationResults, setValidationResults] = useState<
    ReturnValidationResult[]
  >([]);
  const [showValidation, setShowValidation] = useState(false);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  // Get sale transactions for selected customer
  const customerSaleTransactions = useMemo(() => {
    if (!selectedCustomer) return [];

    const transactions = customerTransactions[selectedCustomer.id] || [];
    return transactions.filter(
      (transaction) =>
        transaction.type === "sale" &&
        // Only show transactions from last 30 days for returns
        new Date(transaction.date) >=
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
  }, [selectedCustomer, customerTransactions]);

  // Parse transaction items from description (simplified)
  const parseTransactionItems = (
    transaction: CustomerTransaction
  ): ReturnItem[] => {
    // This is a simplified parser - in a real app, you'd have structured item data
    const items: ReturnItem[] = [];

    if (transaction.description.includes("Wholesale Drum")) {
      const match = transaction.description.match(/(\d+)\s*Wholesale Drum/);
      if (match) {
        const quantity = parseInt(match[1]);
        items.push({
          name: "Wholesale Drum (9 Kegs)",
          quantity: 0,
          price: 9000,
          total: 0,
          maxQuantity: quantity,
        });
      }
    }

    if (transaction.description.includes("Keg")) {
      const match = transaction.description.match(/(\d+)\s*Keg/);
      if (match) {
        const quantity = parseInt(match[1]);
        items.push({
          name: `${quantity} Kegs`,
          quantity: 0,
          price: 1500,
          total: 0,
          maxQuantity: quantity,
        });
      }
    }

    return items;
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleTransactionSelect = (transaction: CustomerTransaction) => {
    setSelectedTransaction(transaction);
    const items = parseTransactionItems(transaction);
    setReturnItems(items);
    setStep(3);
  };

  const handleReturnItemChange = (
    index: number,
    field: "quantity",
    value: number
  ) => {
    setReturnItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQuantity = Math.min(Math.max(0, value), item.maxQuantity);
          return {
            ...item,
            [field]: newQuantity,
            total: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const calculateTotalRefund = () => {
    return returnItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleValidateReturn = () => {
    if (!selectedCustomer || !selectedTransaction || returnItems.length === 0)
      return;

    const validationContext: ReturnValidationContext = {
      originalTransaction: selectedTransaction,
      returnRequest: {
        requestDate: new Date().toISOString().split("T")[0],
        returnItems: returnItems.filter((item) => item.quantity > 0),
        reason: returnReason,
        customerId: selectedCustomer.id,
      },
      customerBalance: selectedCustomer.balance,
      customerType: selectedCustomer.type,
    };

    const results = ReturnValidator.validateReturn(validationContext);
    setValidationResults(results);
    setShowValidation(true);
  };

  const handleSubmitReturn = () => {
    if (
      !selectedCustomer ||
      !selectedTransaction ||
      returnItems.length === 0 ||
      !returnReason
    ) {
      return;
    }

    // Run validation first
    handleValidateReturn();

    const validation = ReturnValidator.getOverallValidation(validationResults);
    if (!validation.canProcess) {
      alert(
        "Cannot process return due to validation errors. Please review and fix the issues."
      );
      return;
    }

    const returnRequest = {
      id: `RET-${Date.now()}`,
      originalTransactionId: selectedTransaction.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      originalDate: selectedTransaction.date,
      requestDate: new Date().toISOString().split("T")[0],
      status: "pending" as const,
      reason: returnReason,
      returnItems: returnItems.filter((item) => item.quantity > 0),
      totalRefundAmount: calculateTotalRefund(),
      notes: returnNotes,
    };

    console.log("Return request submitted:", returnRequest);
    // In a real app, you'd submit this to your API

    // Reset form and close modal
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedTransaction(null);
    setReturnItems([]);
    setReturnReason("");
    setReturnNotes("");
    setCustomerSearch("");
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Process Return Request
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 4:{" "}
                {step === 1
                  ? "Select Customer"
                  : step === 2
                  ? "Select Transaction"
                  : step === 3
                  ? "Select Items"
                  : "Review & Submit"}
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

        {/* Progress bar */}
        <div className="px-6 py-2">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNumber <= step
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-2 mx-2 rounded ${
                      stepNumber < step ? "bg-orange-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Customer
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {customer.phone}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {customer.type} customer
                    </div>
                  </button>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No customers found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Transaction Selection */}
          {step === 2 && selectedCustomer && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-800">
                      Customer: {selectedCustomer.name}
                    </div>
                    <div className="text-sm text-orange-600">
                      Select a transaction from the last 30 days to process
                      return
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {customerSaleTransactions.map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => handleTransactionSelect(transaction)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ₦{transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">SALE</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {customerSaleTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent sales found</p>
                  <p className="text-sm">
                    Customer has no sales in the last 30 days
                  </p>
                </div>
              )}

              <div className="flex justify-start">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back to Customer
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Item Selection */}
          {step === 3 && selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">
                      Transaction: {selectedTransaction.id}
                    </div>
                    <div className="text-sm text-blue-600">
                      Select items and quantities to return
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {returnItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Price: ₦{item.price.toLocaleString()} • Available:{" "}
                          {item.maxQuantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ₦{item.total.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) =>
                          handleReturnItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Refund Amount:</span>
                  <span className="text-orange-600">
                    ₦{calculateTotalRefund().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back to Transaction
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={calculateTotalRefund() === 0}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">
                      Review Return Request
                    </div>
                    <div className="text-sm text-green-600">
                      Please review all details before submitting
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Results */}
              {showValidation && validationResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      Validation Results
                    </h4>
                    <button
                      onClick={handleValidateReturn}
                      className="text-xs text-orange-600 hover:text-orange-700 underline"
                    >
                      Re-validate
                    </button>
                  </div>

                  <div className="space-y-2">
                    {validationResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-2 p-3 rounded-lg border ${
                          result.severity === "error"
                            ? "bg-red-50 border-red-200"
                            : result.severity === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        {result.severity === "error" ? (
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : result.severity === "warning" ? (
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              result.severity === "error"
                                ? "text-red-800"
                                : result.severity === "warning"
                                ? "text-yellow-800"
                                : "text-blue-800"
                            }`}
                          >
                            {result.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const validation =
                      ReturnValidator.getOverallValidation(validationResults);
                    return (
                      <div
                        className={`p-3 rounded-lg border ${
                          validation.canProcess
                            ? validation.hasWarnings
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            validation.canProcess
                              ? validation.hasWarnings
                                ? "text-yellow-800"
                                : "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {validation.summary}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {!showValidation && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <button
                    onClick={handleValidateReturn}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm underline"
                  >
                    Click to validate return request
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </h4>
                  <p className="text-gray-900">{selectedCustomer?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Transaction
                  </h4>
                  <p className="text-gray-900">{selectedTransaction?.id}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Return Items
                </h4>
                <div className="space-y-2">
                  {returnItems
                    .filter((item) => item.quantity > 0)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">
                          ₦{item.total.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Quality issue">Quality issue</option>
                  <option value="Damaged container">Damaged container</option>
                  <option value="Wrong quantity delivered">
                    Wrong quantity delivered
                  </option>
                  <option value="Customer changed mind">
                    Customer changed mind
                  </option>
                  <option value="Excess quantity ordered">
                    Excess quantity ordered
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Add any additional notes about the return..."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Refund Amount:</span>
                  <span className="text-orange-600">
                    ₦{calculateTotalRefund().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back to Items
                </button>
                <button
                  onClick={handleSubmitReturn}
                  disabled={!returnReason || calculateTotalRefund() === 0}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
