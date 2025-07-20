/**
 * Searchable Customer Dropdown Component
 * Optimized for large datasets with search, pagination, and caching
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, User, Phone, Loader } from 'lucide-react';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';
import { useClickOutside } from '@/hooks/useUtilityHooks';

interface CustomerDropdownProps {
    value?: string;
    onChange: (customerId: string, customerName: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const CustomerDropdown: React.FC<CustomerDropdownProps> = ({
    value,
    onChange,
    placeholder = "Select customer...",
    className = "",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsOpen(false);
    });

    const {
        customers,
        hasNextPage,
        isLoading,
        error,
        searchTerm,
        loadMore,
        search,
    } = useCustomerSearch();

    // Handle customer selection
    const handleCustomerSelect = (customer: { id: string; name: string; phone?: string }) => {
        setSelectedCustomer({ id: customer.id, name: customer.name });
        onChange(customer.id, customer.name);
        setIsOpen(false);
    };

    // Handle clear selection
    const handleClear = () => {
        setSelectedCustomer(null);
        onChange('', '');
        // Don't call clear() here - that clears the entire customer list
        // Just clear the selection, keep the customer list intact
    };

    // Handle dropdown toggle
    const toggleDropdown = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    // Set initial selected customer if value is provided
    useEffect(() => {
        if (value && !selectedCustomer) {
            // Find customer in current results
            const customer = customers.find(c => c.id === value);
            if (customer) {
                setSelectedCustomer({ id: customer.id, name: customer.name });
            }
        } else if (!value && selectedCustomer) {
            setSelectedCustomer(null);
        }
    }, [value, customers, selectedCustomer]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <motion.div
                onClick={toggleDropdown}
                className={`
          w-full px-3 py-2 bg-white border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-orange-500 focus:border-transparent 
          text-left flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-orange-500 border-transparent' : ''}
        `}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                whileTap={!disabled ? { scale: 0.99 } : {}}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown();
                    }
                }}
            >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={`truncate ${selectedCustomer ? 'text-gray-900' : 'text-gray-500'}`}>
                        {selectedCustomer ? selectedCustomer.name : placeholder}
                    </span>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                    {selectedCustomer && !disabled && (
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            aria-label="Clear selection"
                        >
                            ×
                        </motion.button>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </motion.div>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => search(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Customer List */}
                        <div className="max-h-60 overflow-y-auto">
                            {/* Walk-in Customer Option */}
                            <motion.button
                                onClick={() => handleCustomerSelect({ id: 'walk-in', name: 'Walk-in Customer' })}
                                className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-100 flex items-center space-x-3"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">Walk-in Customer</div>
                                    <div className="text-xs text-gray-500">No customer account</div>
                                </div>
                            </motion.button>

                            {/* Error State */}
                            {error && (
                                <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
                                    Error: {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && customers.length === 0 && (
                                <div className="px-4 py-8 text-center">
                                    <Loader className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
                                    <div className="text-sm text-gray-600">Loading customers...</div>
                                </div>
                            )}

                            {/* Customer Results */}
                            {customers.map((customer, index) => (
                                <motion.button
                                    key={customer.id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${customer.type === 'WHOLESALE'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-green-100 text-green-600'
                                        }`}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-gray-900 truncate">{customer.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${customer.type === 'WHOLESALE'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {customer.type.toLowerCase()}
                                            </span>
                                        </div>
                                        {customer.phone && (
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Phone className="w-3 h-3" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}

                            {/* Load More Button */}
                            {hasNextPage && (
                                <motion.button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 border-t border-gray-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    whileHover={{ backgroundColor: 'rgba(251, 146, 60, 0.05)' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>Load more customers</span>
                                    )}
                                </motion.button>
                            )}

                            {/* No Results */}
                            {!isLoading && customers.length === 0 && searchTerm && (
                                <div className="px-4 py-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <User className="w-8 h-8 mx-auto" />
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        No customers found for &quot;{searchTerm}&quot;
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
