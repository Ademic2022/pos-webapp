# Customer Credit & Debt Handling System - Complete Implementation

## Overview
The newSale.tsx component now comprehensively handles both customer debt (negative balances) and customer credit (positive balances) in all cart calculations and UI displays. This provides complete financial tracking for customer accounts.

## Balance System Explained

### Balance Values:
- **Positive Balance (+10000)**: Customer has **CREDIT** with the business
- **Negative Balance (-10000)**: Customer has **DEBT** to the business  
- **Zero Balance (0)**: Customer account is balanced

### Real-World Examples:
- **+₦10,000**: Customer paid ₦10,000 in advance or overpaid on previous transactions
- **-₦10,000**: Customer owes ₦10,000 from previous credit sales or unpaid invoices

## Implementation Details

### New Functions Added:

#### `getCustomerCredit(): number`
```typescript
const getCustomerCredit = (): number => {
  if (!selectedCustomer || selectedCustomer.balance <= 0) {
    return 0;
  }
  return selectedCustomer.balance;
};
```

#### `calculateGrandTotal(): number`
```typescript
const calculateGrandTotal = (): number => {
  const currentTotal = calculateTotal();
  const customerDebt = getCustomerDebt();
  const customerCredit = getCustomerCredit();
  
  // If customer has debt, add it to current total
  if (customerDebt > 0) {
    return currentTotal + customerDebt;
  }
  
  // If customer has credit, deduct it from current total
  if (customerCredit > 0) {
    return Math.max(0, currentTotal - customerCredit);
  }
  
  return currentTotal;
};
```

#### `calculateRemainingCredit(): number`
```typescript
const calculateRemainingCredit = (): number => {
  if (!selectedCustomer || selectedCustomer.balance <= 0) {
    return 0;
  }
  
  const currentTotal = calculateTotal();
  const customerCredit = getCustomerCredit();
  
  // If credit is more than the current total, return the remaining credit
  if (customerCredit > currentTotal) {
    return customerCredit - currentTotal;
  }
  
  return 0;
};
```

## User Interface Enhancements

### 1. Customer Selection Area

#### Customer with Debt (-2500):
```
┌─────────────────────────────────────┐
│ Mrs. Fatima Ibrahim                 │
│ 08134567890                         │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️  Outstanding Debt             │ │
│ │     ₦2,500                      │ │
│ │     This will be added to the   │ │
│ │     current sale total          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Customer with Credit (+10000):
```
┌─────────────────────────────────────┐
│ Adebayo Motors                      │
│ 08123456789                         │
│ ┌─────────────────────────────────┐ │
│ │ ✅  Available Credit             │ │
│ │     ₦10,000                     │ │
│ │     This will be deducted from  │ │
│ │     the current sale total      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Cart Totals Section

#### For Customer with Debt:
```
Subtotal:                    ₦15,000
Total:                       ₦15,000

┌─────────────────────────────────────┐
│ Customer Outstanding Debt:  ₦2,500  │
│ ─────────────────────────────────── │
│ Grand Total (including debt): ₦17,500│
└─────────────────────────────────────┘
```

#### For Customer with Credit:
```
Subtotal:                    ₦15,000
Total:                       ₦15,000

┌─────────────────────────────────────┐
│ Customer Available Credit:  ₦10,000 │
│ ─────────────────────────────────── │
│ Amount Due (after credit):  ₦5,000  │
│ Remaining Credit After Sale: ₦0     │
└─────────────────────────────────────┘
```

#### For Customer with More Credit than Sale:
```
Subtotal:                    ₦5,000
Total:                       ₦5,000

┌─────────────────────────────────────┐
│ Customer Available Credit:  ₦10,000 │
│ ─────────────────────────────────── │
│ Amount Due (after credit):  ₦0      │
│ Remaining Credit After Sale: ₦5,000 │
└─────────────────────────────────────┘
```

### 3. Customer Selection Modal

Each customer now shows their financial status:
```
┌─────────────────────────────────────┐
│ Adebayo Motors                      │
│ 08123456789                         │
│ Credit: ₦10,000                     │ ← GREEN
│ wholesale customer                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Mrs. Fatima Ibrahim                 │
│ 08134567890                         │
│ Debt: ₦2,500                        │ ← RED
│ retail customer                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Blessing Oil Depot                  │
│ 08167890123                         │
│ wholesale customer                  │ ← No balance shown (₦0)
└─────────────────────────────────────┘
```

## Calculation Logic Examples

### Example 1: Customer with ₦10,000 Credit, ₦15,000 Sale
- **Current Sale Total**: ₦15,000
- **Customer Credit**: ₦10,000
- **Amount Due**: ₦5,000 (₦15,000 - ₦10,000)
- **Remaining Credit**: ₦0

### Example 2: Customer with ₦10,000 Credit, ₦5,000 Sale  
- **Current Sale Total**: ₦5,000
- **Customer Credit**: ₦10,000
- **Amount Due**: ₦0 (₦5,000 - ₦10,000 = ₦0, minimum)
- **Remaining Credit**: ₦5,000

### Example 3: Customer with ₦2,500 Debt, ₦15,000 Sale
- **Current Sale Total**: ₦15,000
- **Customer Debt**: ₦2,500
- **Grand Total**: ₦17,500 (₦15,000 + ₦2,500)
- **Amount Due**: ₦17,500

## Part Payment Integration

### For Customers with Credit:
- Maximum payment amount considers credit deduction
- If sale is ₦15,000 and customer has ₦10,000 credit:
  - Maximum part payment: ₦5,000 (the actual amount due)

### For Customers with Debt:
- Maximum payment amount includes debt
- If sale is ₦15,000 and customer owes ₦2,500:
  - Maximum part payment: ₦17,500 (sale + debt)

## Test Scenarios

### Available Test Data:
1. **Adebayo Motors** (ID: 1) - ₦10,000 credit
2. **Mrs. Fatima Ibrahim** (ID: 2) - ₦2,500 debt  
3. **Kemi's Store** (ID: 3) - ₦7,500 debt
4. **Taiwo Enterprises** (ID: 4) - ₦15,000 debt
5. **Blessing Oil Depot** (ID: 5) - ₦0 balance

### Testing Steps:
1. **Test Credit Handling**:
   - Select "Adebayo Motors" 
   - Add ₦15,000 worth of products
   - Verify amount due shows ₦5,000
   - Verify remaining credit shows ₦0

2. **Test Credit Exceeding Sale**:
   - Select "Adebayo Motors"
   - Add ₦5,000 worth of products  
   - Verify amount due shows ₦0
   - Verify remaining credit shows ₦5,000

3. **Test Debt Handling**:
   - Select "Mrs. Fatima Ibrahim"
   - Add ₦10,000 worth of products
   - Verify grand total shows ₦12,500
   - Test part payment functionality

## Business Benefits

### 1. **Complete Financial Tracking**
- All customer credits and debts are visible and calculated
- Staff can see exact amounts due considering all factors

### 2. **Improved Cash Flow**
- Credits are automatically applied, reducing customer payments
- Debts are automatically included, ensuring collection

### 3. **Customer Satisfaction**
- Customers see their credits being properly applied
- Transparent display of all financial information

### 4. **Audit Trail**
- Every transaction considers complete customer financial status
- Clear documentation of credit usage and debt inclusion

## Color Coding System

- **🔴 Red**: Debt-related information (negative balances)
- **🟢 Green**: Credit-related information (positive balances)
- **🟠 Orange**: Standard transaction information
- **🟣 Purple**: Part payment information

## Implementation Status
- ✅ **Customer credit detection and calculation**
- ✅ **Customer debt handling (existing)**
- ✅ **Enhanced cart totals with credit/debt display**
- ✅ **Customer selection area with balance indicators**
- ✅ **Customer modal with credit/debt display**
- ✅ **Part payment integration with credit/debt**
- ✅ **Remaining credit calculation**
- ✅ **No TypeScript or ESLint errors**
- ✅ **Production-ready implementation**

The system now provides complete customer financial management within the POS interface, ensuring accurate transactions and transparent customer account handling.
