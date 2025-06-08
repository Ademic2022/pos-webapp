"use client";

import React, { useState, useEffect } from "react";
import { X, User, Building, Loader2 } from "lucide-react";
import { Customer } from "@/interfaces/interface";
import ProtectedElement from "@/components/auth/ProtectedElement";

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (updatedCustomer: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
        type: customer.type,
        creditLimit: customer.creditLimit,
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  // Clear validation error when user starts typing
  useEffect(() => {
    if (validationError) {
      setValidationError("");
    }
  }, [formData, validationError]);

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      setValidationError("Customer name is required");
      return false;
    }

    if (!formData.phone?.trim()) {
      setValidationError("Phone number is required");
      return false;
    }

    if (formData.creditLimit && formData.creditLimit < 0) {
      setValidationError("Credit limit cannot be negative");
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof Customer, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async () => {
    if (!customer || !validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedCustomer: Customer = {
        ...customer,
        name: formData.name?.trim() || customer.name,
        phone: formData.phone?.trim() || customer.phone,
        email: formData.email?.trim() || "",
        address: formData.address?.trim() || "",
        type: formData.type || customer.type,
        creditLimit: formData.creditLimit || customer.creditLimit,
        notes: formData.notes?.trim() || "",
      };

      onSave(updatedCustomer);
      onClose();
    } catch (error) {
      console.error("Error updating customer:", error);
      setValidationError("Failed to update customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                {customer.type === "wholesale" ? (
                  <Building className="w-5 h-5 text-orange-600" />
                ) : (
                  <User className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Customer
                </h3>
                <p className="text-sm text-gray-600">
                  Update {customer.name}&apos;s information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
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
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="08123456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="customer@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Customer address"
            />
          </div>

          <div className="grid md:grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                value={formData.type || "retail"}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "wholesale" | "retail"
                  )
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              >
                <option value="retail">Retail Customer</option>
                <option value="wholesale">Wholesale Customer</option>
              </select>
            </div>
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
                  formData.creditLimit === 0 ? "" : formData.creditLimit || ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "creditLimit",
                    e.target.value === "" ? 0 : parseInt(e.target.value)
                  )
                }
                className="w-full pl-8 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                placeholder="5000"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
              placeholder="Additional notes about the customer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.phone || isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </ProtectedElement>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
