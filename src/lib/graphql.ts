import { enhancedGraphqlClient } from './enhancedGraphqlClient';

// Use the enhanced client with automatic token refresh
export const graphqlClient = enhancedGraphqlClient;

// Also export the enhanced client directly
export { enhancedGraphqlClient };

// Backward compatibility functions
export const setAuthToken = (token: string) => {
  enhancedGraphqlClient.setAuthToken(token);
};

export const clearAuthToken = () => {
  enhancedGraphqlClient.clearAuthToken();
};

// Auth mutation
export const TOKEN_AUTH = `
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      success
      refreshToken
      errors
      user {
        id
        email
        firstName
        lastName
        username
        phone
        address
        isSuperuser
        isStaff
      }
    }
  }
`;

// Verify token mutation/query
export const VERIFY_TOKEN = `
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      success
      errors
      payload
    }
  }
`;

// Refresh token mutation
export const REFRESH_TOKEN = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      success
      errors
    }
  }
`;

// View current user profile query
export const VIEW_ME = `
  query {
    viewMe {
      firstName
      lastName
      phone
      address
      email
      username
    }
  }
`;

// Update account mutation
export const UPDATE_ACCOUNT = `
  mutation UpdateAccount(
    $username: String,
    $firstName: String,
    $lastName: String,
    $phone: String,
    $address: String
  ) {
    updateAccount(
      username: $username,
      firstName: $firstName,
      lastName: $lastName,
      phone: $phone,
      address: $address
    ) {
      success
      errors
    }
  }
`;

// Customer queries
export const GET_CUSTOMERS = `
  query GetCustomers(
    $first: Int, 
    $after: String,
    $name_Icontains: String,
    $type: CustomerTypeEnum,
    $status: CustomerStatusEnum,
    $balance_Gt: Decimal,
    $balance_Lt: Decimal
  ) {
    customers(
      first: $first, 
      after: $after,
      name_Icontains: $name_Icontains,
      type: $type,
      status: $status,
      balance_Gt: $balance_Gt,
      balance_Lt: $balance_Lt
    ) {
      edges {
        node {
          id
          name
          email
          phone
          address
          type
          status
          balance
          creditLimit
          totalPurchases
          lastPurchase
          joinDate
          notes
          availableCredit
          isCreditAvailable
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_CUSTOMER = `
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      name
      email
      phone
      address
      type
      status
      balance
      creditLimit
      totalPurchases
      lastPurchase
      joinDate
      notes
      availableCredit
      isCreditAvailable
    }
  }
`;

export const GET_CUSTOMER_BY_PHONE = `
  query GetCustomerByPhone($phone: String!) {
    customerByPhone(phone: $phone) {
      id
      name
      email
      phone
      address
      type
      status
      balance
      creditLimit
      totalPurchases
      lastPurchase
      joinDate
      notes
      availableCredit
      isCreditAvailable
    }
  }
`;

export const GET_CUSTOMER_STATS = `
  query GetCustomerStats {
    customerStats {
      totalCustomers
      retailCustomers
      wholesaleCustomers
      activeCustomers
      inactiveCustomers
      blockedCustomers
      totalCreditIssued
      totalOutstandingBalance
    }
  }
`;

// Customer mutations
export const CREATE_CUSTOMER = `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      success
      customer {
        id
        name
        email
        phone
        address
        type
        status
        balance
        creditLimit
        totalPurchases
        lastPurchase
        joinDate
        notes
        availableCredit
        isCreditAvailable
      }
      errors
    }
  }
`;

export const UPDATE_CUSTOMER = `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      success
      customer {
        id
        name
        email
        phone
        address
        type
        status
        balance
        creditLimit
        totalPurchases
        lastPurchase
        joinDate
        notes
        availableCredit
        isCreditAvailable
      }
      errors
    }
  }
`;

export const DELETE_CUSTOMER = `
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      success
      errors
    }
  }
`;


export const PRODUCT_INVENTORY_QUERY = `
  query ProductInventory {
    products {
      edges {
        node {
          id
          name
          price
          saleType
          stock
          unit
          updatedAt
        }
      }
    }
    latestStockDeliveries(limit: 1) {
      id
      deliveredQuantity
      cumulativeStock
      remainingStock
      soldStock
      price
      stockUtilizationPercentage
    }
  }
`;


export const PRODUCT_INVENTORY = `
  query ProductInventory {
    products {
      edges {
        node {
          id
          name
          price
          saleType
          stock
          unit
          updatedAt
        }
      }
    }
  }
`;

export const ADD_STOCK_DELIVERY_MUTATION = `
  mutation AddStockDelivery($deliveredQuantity: Float!, $supplier: String!, $price: Decimal!) {
    addStockDelivery(
      deliveredQuantity: $deliveredQuantity
      supplier: $supplier
      price: $price
    ) {
      message
      success
      stockData {
        id
        createdAt
        cumulativeStock
        deliveredQuantity
        previousRemainingStock
        price
        soldStock
        remainingStock
        stockUtilizationPercentage
        supplier
        updatedAt
      }
    }
  }
`;

export const STOCK_DELIVERIES_QUERY = `
  query StockDeliveries($limit: Int) {
    latestStockDeliveries(limit: $limit) {
      id
      deliveredQuantity
      cumulativeStock
      remainingStock
      soldStock
      price
      stockUtilizationPercentage
      createdAt
      supplier
    }
  }
`;

export const SALES_QUERY = `
  query Sales(
    $first: Int,
    $after: String,
    $saleType: String,
    $customerName: String,
    $totalMin: Float,
    $totalMax: Float,
    $dateFrom: Date,
    $dateTo: Date
  ) {
    sales(
      first: $first,
      after: $after,
      saleType: $saleType,
      customerName: $customerName,
      totalMin: $totalMin,
      totalMax: $totalMax,
      createdAt_Date_Gte: $dateFrom,
      createdAt_Date_Lte: $dateTo
    ) {
      edges {
        node {
          id
          transactionId
          customer {
            id
            name
            phone
          }
          saleType
          subtotal
          discount
          total
          amountDue
          createdAt
          updatedAt
          items {
            id
            product {
              id
              name
              unit
            }
            quantity
            unitPrice
            totalPrice
          }
          payments {
            id
            method
            amount
            createdAt
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const SALE_BY_ID_QUERY = `
  query Sale($id: $ID!) {
    sale(id: $id) {
      id
      transactionId
      customer {
        id
        name
        phone
        email
      }
      saleType
      subtotal
      discount
      total
      amountDue
      createdAt
      updatedAt
      items {
        id
        product {
          id
          name
          unit
          price
        }
        quantity
        unitPrice
        totalPrice
      }
      payments {
        id
        method
        amount
        createdAt
      }
    }
  }
`;

export const SALES_STATS_QUERY = `
  query SalesStats($dateFrom: Date, $dateTo: Date) {
    salesStats(dateFrom: $dateFrom, dateTo: $dateTo) {
      totalSales
      totalTransactions
      averageSaleValue
      retailSales
      wholesaleSales
      cashSales
      creditSales
      totalDiscounts
    }
  }
`;

export const RECENT_SALES_QUERY = `
  query RecentSales($limit: Int = 10) {
    recentSales(limit: $limit) {
      id
      transactionId
      customer {
        name
      }
      saleType
      total
      amountDue
      createdAt
    }
  }
`;

// Customer Credit mutations
export const ADD_CUSTOMER_CREDIT_MUTATION = `
  mutation AddCustomerCredit($customerId: ID!, $amount: Float!) {
    addCustomerCredit(customerId: $customerId, amount: $amount) {
      success
      errors
      balance
    }
  }
`;

export const CUSTOMER_CREDIT_BALANCE_QUERY = `
  query CustomerCreditBalance($customerId: ID!) {
    customerCreditBalance(customerId: $customerId) {
      balance
      creditLimit
      transactions {
        id
        amount
        transactionType
        createdAt
      }
    }
  }
`;

// Sales mutations
export const CREATE_SALE_MUTATION = `
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(input: $input) {
      success
      message
      errors
      sale {
        id
        transactionId
        customer {
          id
          name
          phone
        }
        saleType
        subtotal
        discount
        total
        amountDue
        createdAt
        items {
          id
          product {
            id
            name
            unit
          }
          quantity
          unitPrice
          totalPrice
        }
        payments {
          id
          method
          amount
          createdAt
        }
      }
    }
  }
`;

export const ADD_PAYMENT_MUTATION = `
  mutation AddPayment($saleId: ID!, $input: PaymentInput!) {
    addPayment(saleId: $saleId, input: $input) {
      success
      errors
      payment {
        id
        method
        amount
        createdAt
      }
    }
  }
`;

// Fallback queries for individual metrics if dashboard query is not available
export const QUICK_DASHBOARD_METRICS = `
  query QuickDashboardMetrics($dateFrom: Date, $dateTo: Date) {
    salesStats(dateFrom: $dateFrom, dateTo: $dateTo) {
      totalSales
      totalTransactions
      retailSales
      wholesaleSales
      cashSales
      creditSales
    }
    
    customerStats {
      totalCustomers
      totalOutstandingBalance
    }
    
    latestStockDeliveries(limit: 1) {
      id
      deliveredQuantity
      cumulativeStock
      remainingStock
      soldStock
      price
      stockUtilizationPercentage
      createdAt
      supplier
    }
  }
`;