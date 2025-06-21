// Test script for authentication flow
const { GraphQLClient } = require("graphql-request");

const GRAPHQL_ENDPOINT = "http://127.0.0.1:8000/graphql/";

const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_AUTH = `
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

const VERIFY_TOKEN = `
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      success
      errors
      payload
    }
  }
`;

async function testAuthFlow() {
  console.log("🔐 Testing Authentication Flow...\n");

  try {
    // Test login with provided credentials
    console.log(
      '1. Testing login with credentials: username="ademic", password="String@1234"'
    );

    const loginResponse = await graphqlClient.request(TOKEN_AUTH, {
      username: "ademic",
      password: "String@1234",
    });

    console.log("Login Response:", JSON.stringify(loginResponse, null, 2));

    if (loginResponse.tokenAuth.success && loginResponse.tokenAuth.token) {
      console.log("✅ Login successful!");

      const token = loginResponse.tokenAuth.token;
      const user = loginResponse.tokenAuth.user;

      console.log("\n2. Testing token verification...");

      // Test token verification
      const verifyResponse = await graphqlClient.request(VERIFY_TOKEN, {
        token: token,
      });

      console.log("Verify Response:", JSON.stringify(verifyResponse, null, 2));

      if (verifyResponse.verifyToken.success) {
        console.log("✅ Token verification successful!");

        console.log("\n📋 Authentication Summary:");
        console.log(`- User ID: ${user.id}`);
        console.log(`- Username: ${user.username}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Name: ${user.firstName} ${user.lastName}`);
        console.log(`- Is Staff: ${user.isStaff}`);
        console.log(`- Is Superuser: ${user.isSuperuser}`);
        console.log(`- Token: ${token.substring(0, 20)}...`);

        return {
          success: true,
          token,
          user,
        };
      } else {
        console.log("❌ Token verification failed");
        console.log("Errors:", verifyResponse.verifyToken.errors);
        return { success: false };
      }
    } else {
      console.log("❌ Login failed");
      console.log("Errors:", loginResponse.tokenAuth.errors);
      return { success: false };
    }
  } catch (error) {
    console.log("❌ Authentication test failed with error:");
    console.error(error);
    return { success: false, error };
  }
}

// Run the test
testAuthFlow().then((result) => {
  if (result.success) {
    console.log("\n🎉 All authentication tests passed!");
    console.log("\nThe login system is ready for use. You can now:");
    console.log("1. Visit http://localhost:3001/signin");
    console.log('2. Use username: "ademic" and password: "String@1234"');
    console.log("3. Successfully authenticate and access the POS system");
  } else {
    console.log(
      "\n❌ Authentication tests failed. Please check the backend configuration."
    );
  }
  process.exit(result.success ? 0 : 1);
});
