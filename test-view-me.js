#!/usr/bin/env node

// Test script to check viewMe query fields
import { graphqlClient } from "./src/lib/graphql.ts";

const TOKEN_AUTH = `
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      success
      refreshToken
      errors
    }
  }
`;

const VIEW_ME = `
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

async function testViewMe() {
  console.log("🔍 Testing viewMe query...\n");

  try {
    // Step 1: Login to get token
    console.log("1. Logging in to get token...");

    const loginResponse = await graphqlClient.request(TOKEN_AUTH, {
      username: "ademic",
      password: "String@1234",
    });

    if (!loginResponse.tokenAuth.success) {
      console.log("❌ Login failed:", loginResponse.tokenAuth.errors);
      return;
    }

    const token = loginResponse.tokenAuth.token;
    console.log("✅ Login successful, token obtained");

    // Set authorization header
    graphqlClient.setHeader("Authorization", `Bearer ${token}`);

    // Step 2: Test viewMe query
    console.log("\n2. Testing viewMe query...");

    const viewMeResponse = await graphqlClient.request(VIEW_ME);
    console.log("📄 viewMe Response:", JSON.stringify(viewMeResponse, null, 2));
  } catch (error) {
    console.log("❌ viewMe test failed with error:");
    console.error(error);
  }
}

testViewMe();
