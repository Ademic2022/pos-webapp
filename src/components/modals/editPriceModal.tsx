"use client";

import React from "react";
import { X, Package } from "lucide-react";

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
    category: "wholesale" | "retail";
  } | null;
  tempPrice: string;
  setTempPrice: (value: string) => void;
  onSave: () => void;
  formatPrice: (price: number) => string;
}

const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  tempPrice,
  setTempPrice,
  onSave,
  formatPrice,
}) => {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Product Price
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedProduct.name}
                </p>
                <p className="text-sm text-gray-600">
                  Stock: {selectedProduct.stock} {selectedProduct.unit}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(selectedProduct.price)}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Price (₦)
            </label>
            <input
              id="newPrice"
              type="number"
              step="0.01"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter new price"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPriceModal;
