import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = 'http://127.0.0.1:8000/graphql/';

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
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
