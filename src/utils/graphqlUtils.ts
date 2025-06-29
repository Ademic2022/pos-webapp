/**
 * GraphQL Utilities
 * 
 * Utility functions for handling GraphQL-specific operations like
 * decoding global IDs and handling relay-style connections.
 */

/**
 * Decode a GraphQL global ID to get the actual database ID
 * GraphQL global IDs are base64 encoded strings in the format: "TypeName:id"
 * This version handles URL encoding as well for robustness
 */
export function decodeGraphQLId(globalId: string): string {
  try {
    // First, decode URL encoding (e.g., %3D back to =)
    const urlDecoded = decodeURIComponent(globalId);
    
    // Then decode base64 string
    const decoded = atob(urlDecoded);
    
    // Extract the numeric ID after the colon (format: "CustomerType:123")
    const parts = decoded.split(':');
    return parts.length === 2 ? parts[1] : globalId;
  } catch {
    // If decoding fails, assume it's already a numeric ID
    console.warn('Failed to decode Relay Global ID, using as-is:', globalId);
    return globalId;
  }
}

/**
 * Encode a database ID into a GraphQL global ID
 * This is useful when you need to create a global ID for a given type and ID
 */
export function encodeGraphQLId(typeName: string, id: string | number): string {
  return btoa(`${typeName}:${id}`);
}

/**
 * Check if a string is a GraphQL global ID (base64 encoded)
 */
export function isGraphQLGlobalId(id: string): boolean {
  try {
    const decoded = atob(id);
    return decoded.includes(':');
  } catch {
    return false;
  }
}

/**
 * Extract all IDs from a relay-style connection
 */
export function extractIdsFromConnection<T extends { id: string }>(
  connection: { edges: Array<{ node: T }> }
): string[] {
  return connection.edges.map(edge => decodeGraphQLId(edge.node.id));
}

/**
 * Safe ID extraction - handles both regular IDs and GraphQL global IDs
 * This is a robust function that can handle various ID formats
 */
export function safeExtractId(id: string): string {
  return decodeGraphQLId(id);
}
