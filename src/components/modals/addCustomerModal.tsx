"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Customer } from "@/interfaces/interface";
import { useAsyncLoading } from "@/hooks/usePageLoading";
import ProtectedElement from "@/components/auth/ProtectedElement";

interface AddCustomerModalProps {
  show: boolean;
  newCustomer: Partial<Customer>;
  setNewCustomer: (customer: Partial<Customer>) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  validationError?: string;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  show,
  newCustomer,
  setNewCustomer,
  onClose,
  onSubmit,
  validationError,
}) => {
  const { withLoading } = useAsyncLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await withLoading(async () => {
        await onSubmit();
      }, "Adding customer...");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Add New Customer
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-700 text-sm">{validationError}</div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={newCustomer.name || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={newCustomer.phone || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="08123456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={newCustomer.address || ""}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, address: e.target.value })
              }
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Customer address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Limit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">₦</span>
              <input
                type="number"
                value={
                  newCustomer.creditLimit === 0
                    ? ""
                    : newCustomer.creditLimit || ""
                }
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    creditLimit:
                      e.target.value === "" ? 0 : parseInt(e.target.value),
                  })
                }
                className="w-full pl-8 px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="5000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={newCustomer.notes || ""}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Additional notes about the customer"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
            <button
              onClick={handleSubmit}
              disabled={!newCustomer.name || !newCustomer.phone || isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Adding..." : "Add Customer"}
            </button>
          </ProtectedElement>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
