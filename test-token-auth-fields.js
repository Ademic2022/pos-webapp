#!/usr/bin/env node

// Test script to check TOKEN_AUTH with phone and address fields
import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT = "http://127.0.0.1:8000/graphql/";
const client = new GraphQLClient(GRAPHQL_ENDPOINT);

const TOKEN_AUTH_WITH_PHONE_ADDRESS = `
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

async function testTokenAuthFields() {
  console.log("🔍 Testing TOKEN_AUTH with phone and address fields...\n");

  try {
    console.log("1. Testing login with phone and address in TOKEN_AUTH...");

    const response = await client.request(TOKEN_AUTH_WITH_PHONE_ADDRESS, {
      username: "ademic",
      password: "String@1234",
    });

    console.log("📄 TOKEN_AUTH Response:", JSON.stringify(response, null, 2));

    if (response.tokenAuth.success) {
      const user = response.tokenAuth.user;
      console.log("\n📋 User Data Breakdown:");
      console.log("- ID:", user.id);
      console.log("- Username:", user.username);
      console.log("- Email:", user.email);
      console.log("- First Name:", user.firstName);
      console.log("- Last Name:", user.lastName);
      console.log("- Phone:", user.phone);
      console.log("- Address:", user.address);
      console.log("- Is Staff:", user.isStaff);
      console.log("- Is Superuser:", user.isSuperuser);

      if (user.phone && user.address) {
        console.log("\n✅ SUCCESS: TOKEN_AUTH does return phone and address!");
      } else {
        console.log(
          "\n❌ ISSUE: TOKEN_AUTH is not returning phone and address even though they're in schema"
        );
        console.log("Phone value:", user.phone);
        console.log("Address value:", user.address);
      }
    }
  } catch (error) {
    console.log("❌ TOKEN_AUTH test failed:");
    console.error(error);
  }
}

testTokenAuthFields();
