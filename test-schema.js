#!/usr/bin/env node

// Test script to introspect the actual GraphQL schema
import { graphqlClient } from "./src/lib/graphql.ts";

const INTROSPECTION_QUERY = `
  query IntrospectTokenAuth {
    __schema {
      mutationType {
        fields {
          name
          type {
            name
            fields {
              name
              type {
                name
                fields {
                  name
                  type {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Simpler query to check user type fields
const USER_TYPE_QUERY = `
  query {
    __type(name: "UserNode") {
      fields {
        name
        type {
          name
        }
      }
    }
  }
`;

async function checkSchema() {
  console.log("🔍 Checking GraphQL Schema...\n");

  try {
    console.log("1. Checking UserNode type fields...");
    const userTypeResponse = await graphqlClient.request(USER_TYPE_QUERY);
    console.log(
      "📄 UserNode fields:",
      JSON.stringify(userTypeResponse, null, 2)
    );
  } catch (error) {
    console.log("❌ Schema introspection failed:");
    console.error(error);
  }
}

checkSchema();
