import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://127.0.0.1:8000/graphql/';

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
  errorPolicy: 'all', // Return both data and errors
});

// Function to set authorization header
export const setAuthToken = (token: string) => {
  graphqlClient.setHeader('Authorization', `Bearer ${token}`);
};

// Function to clear authorization header
export const clearAuthToken = () => {
  graphqlClient.setHeader('Authorization', '');
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
  query GetCustomers($first: Int, $after: String) {
    customers(first: $first, after: $after) {
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
