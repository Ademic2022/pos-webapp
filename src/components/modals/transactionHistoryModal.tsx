import React from "react";
import { X, DollarSign, Package, CreditCard } from "lucide-react";
// import { Customer } from "@/interfaces/interface";

interface Customer {
  id: string | number;
  name: string;
  balance: number;
  creditLimit: number;
  totalPurchases: number;
}

interface Transaction {
  id: string | number;
  type: "sale" | "payment" | "credit";
  description: string;
  date: string;
  amount: number;
  balance: number;
}

interface Props {
  show: boolean;
  customer: Customer | null;
  transactions: Record<string | number, Transaction[]>;
  onClose: () => void;
  onRecordPayment: () => void;
  getBalanceColor: (balance: number) => string;
}

const TransactionHistoryModal: React.FC<Props> = ({
  show,
  customer,
  transactions,
  onClose,
  onRecordPayment,
  getBalanceColor,
}) => {
  if (!show || !customer) return null;

  const customerTxns = transactions[customer.id] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h3>
              <p className="text-sm text-gray-600">{customer.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Current Balance</div>
              <div
                className={`text-lg font-bold ${getBalanceColor(
                  customer.balance
                )}`}
              >
                ₦{Math.abs(customer.balance).toLocaleString()}
                {customer.balance < 0 && (
                  <span className="text-sm ml-1">(debt)</span>
                )}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Total Purchases</div>
              <div className="text-lg font-bold text-green-900">
                ₦{customer.totalPurchases.toLocaleString()}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">Credit Limit</div>
              <div className="text-lg font-bold text-orange-900">
                ₦{customer.creditLimit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Transactions</h4>

            {customer.balance < 0 && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment();
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                <DollarSign className="w-3 h-3" />
                <span>Record Payment</span>
              </button>
            )}

            {customerTxns.length ? (
              customerTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        txn.type === "sale"
                          ? "bg-blue-100"
                          : txn.type === "payment"
                          ? "bg-green-100"
                          : "bg-orange-100"
                      }`}
                    >
                      {txn.type === "sale" ? (
                        <Package className="w-4 h-4 text-blue-600" />
                      ) : txn.type === "payment" ? (
                        <DollarSign className="w-4 h-4 text-green-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {txn.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {txn.date} • {txn.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${
                        txn.type === "payment"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {txn.type === "payment" ? "+" : ""}₦
                      {txn.amount.toLocaleString()}
                    </div>
                    <div className={`text-sm ${getBalanceColor(txn.balance)}`}>
                      Balance: ₦{Math.abs(txn.balance).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
