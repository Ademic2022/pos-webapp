"use client";
import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAsyncLoading } from "@/hooks/usePageLoading";
import ProtectedElement from "@/components/auth/ProtectedElement";
import { DeleteCustomerModalProps } from "@/interfaces/interface";

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  show,
  customerName,
  onClose,
  onDelete,
}) => {
  const { withLoading } = useAsyncLoading();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await withLoading(async () => {
        await onDelete();
      }, "Deleting customer...");
    } finally {
      setIsDeleting(false);
    }
  };
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Customer
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <strong>{customerName}</strong>? All
            transaction history will be permanently removed.
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <ProtectedElement requiredPermission="EDIT_CUSTOMER_DETAILS">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Customer"}
              </button>
            </ProtectedElement>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerModal;
