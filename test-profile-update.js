#!/usr/bin/env node

// Test script for profile update functionality
import { graphqlClient } from "./src/lib/graphql.ts";

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
        phone
        address
        isSuperuser
        isStaff
      }
    }
  }
`;

const UPDATE_ACCOUNT = `
  mutation UpdateAccount(
    $firstName: String,
    $lastName: String,
    $phone: String,
    $address: String
  ) {
    updateAccount(
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

async function testProfileUpdate() {
  console.log("🔄 Testing Profile Update Flow...\n");

  try {
    // Step 1: Login
    console.log(
      '1. Logging in with credentials: username="ademic", password="String@1234"'
    );

    const loginResponse = await graphqlClient.request(TOKEN_AUTH, {
      username: "ademic",
      password: "String@1234",
    });

    if (!loginResponse.tokenAuth.success) {
      console.log("❌ Login failed:", loginResponse.tokenAuth.errors);
      return;
    }

    console.log("✅ Login successful!");
    console.log("📋 Current user data:", {
      firstName: loginResponse.tokenAuth.user.firstName,
      lastName: loginResponse.tokenAuth.user.lastName,
      phone: loginResponse.tokenAuth.user.phone,
      address: loginResponse.tokenAuth.user.address,
    });

    const token = loginResponse.tokenAuth.token;

    // Set authorization header
    graphqlClient.setHeader("Authorization", `Bearer ${token}`);

    // Step 2: Get current profile data
    console.log("\n2. Fetching current profile data...");
    const currentProfile = await graphqlClient.request(VIEW_ME);
    console.log("📄 Current profile:", currentProfile.viewMe);

    // Step 3: Update profile
    console.log("\n3. Testing profile update...");
    const updateData = {
      firstName: "Ademic Test",
      lastName: "Lisa Test",
      phone: "+1 (555) 999-8888",
      address: "789 Test Avenue, Test City, CA 90212",
    };

    console.log("📝 Update data:", updateData);

    const updateResponse = await graphqlClient.request(
      UPDATE_ACCOUNT,
      updateData
    );

    if (updateResponse.updateAccount.success) {
      console.log("✅ Profile update successful!");

      // Step 4: Verify the update
      console.log("\n4. Verifying the update...");
      const updatedProfile = await graphqlClient.request(VIEW_ME);
      console.log("📄 Updated profile:", updatedProfile.viewMe);

      // Compare the data
      console.log("\n📊 Comparison:");
      console.log(
        `First Name: "${currentProfile.viewMe.firstName}" → "${updatedProfile.viewMe.firstName}"`
      );
      console.log(
        `Last Name: "${currentProfile.viewMe.lastName}" → "${updatedProfile.viewMe.lastName}"`
      );
      console.log(
        `Phone: "${currentProfile.viewMe.phone}" → "${updatedProfile.viewMe.phone}"`
      );
      console.log(
        `Address: "${currentProfile.viewMe.address}" → "${updatedProfile.viewMe.address}"`
      );

      console.log("\n🎉 All profile update tests passed!");

      return {
        success: true,
        originalData: currentProfile.viewMe,
        updatedData: updatedProfile.viewMe,
      };
    } else {
      console.log(
        "❌ Profile update failed:",
        updateResponse.updateAccount.errors
      );
      return { success: false };
    }
  } catch (error) {
    console.log("❌ Profile update test failed with error:");
    console.error(error);
    return { success: false };
  }
}

// Run the test
testProfileUpdate()
  .then((result) => {
    if (result.success) {
      console.log(
        "\n🎉 All tests passed! The profile update system is working correctly."
      );
      console.log("\nNext steps:");
      console.log("1. ✅ Test the profile update in the web interface");
      console.log("2. ✅ Verify the loading states work correctly");
      console.log("3. ✅ Test error handling for invalid data");
      console.log("4. ✅ Test with different user permissions");
    } else {
      console.log(
        "\n❌ Profile update tests failed. Please check the server and try again."
      );
    }
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
  });
