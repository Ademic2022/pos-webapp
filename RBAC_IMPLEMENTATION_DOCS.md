# RBAC (Role-Based Access Control) Implementation Documentation

## Overview
This document provides comprehensive documentation for the RBAC system implemented in the POS Web Application. The system provides fine-grained access control for both page-level routing and individual UI elements.

## Permission System Architecture

### Permission Types
The system defines the following permissions in `src/context/AuthContext.tsx`:

```typescript
type PermissionType = 
  | "VIEW_INVENTORY_SETTINGS"
  | "EDIT_PRICES"
  | "DELETE_PRODUCTS" 
  | "MANAGE_USERS"
  | "VIEW_REPORTS"
  | "EDIT_CUSTOMER_DETAILS"
  | "DELETE_CUSTOMERS"
  | "PROCESS_RETURNS"
  | "VALIDATE_SALES"
  | "MANAGE_STOCK"
  | "VIEW_FINANCIAL_DATA";
```

### User Roles and Permissions

#### Superuser (is_superuser: true)
- **Access Level**: Full access to everything
- **Permissions**: All permissions listed above
- **Restrictions**: None

#### Staff (is_staff: true, is_superuser: false)  
- **Access Level**: Limited administrative access
- **Permissions**:
  - `VIEW_REPORTS`
  - `EDIT_CUSTOMER_DETAILS`
  - `PROCESS_RETURNS`
  - `MANAGE_STOCK`

#### Regular User (is_staff: false, is_superuser: false)
- **Access Level**: Very limited access
- **Permissions**:
  - `VIEW_REPORTS` (basic reports only)

## RBAC Components

### 1. ProtectedRoute Component
**Location**: `src/components/auth/ProtectedRoute.tsx`

**Purpose**: Protects entire pages/routes from unauthorized access

**Usage Examples**:
```tsx
// Protect page for superusers only
<ProtectedRoute requireSuperuser={true}>
  <YourPageContent />
</ProtectedRoute>

// Protect page for staff and above
<ProtectedRoute requireStaff={true}>
  <YourPageContent />
</ProtectedRoute>

// Protect page for specific permission
<ProtectedRoute requiredPermission="MANAGE_USERS">
  <YourPageContent />
</ProtectedRoute>
```

**Features**:
- Shows customized error screens for different access levels
- Provides "Go Back" functionality
- Graceful fallback options

### 2. ProtectedElement Component
**Location**: `src/components/auth/ProtectedElement.tsx`

**Purpose**: Protects individual UI elements (buttons, sections, etc.) from unauthorized access

**Usage Examples**:
```tsx
// Hide button if user doesn't have permission
<ProtectedElement requiredPermission="EDIT_PRICES">
  <button>Edit Price</button>
</ProtectedElement>

// Show placeholder if no access
<ProtectedElement 
  requiredPermission="VIEW_FINANCIAL_DATA" 
  hideIfNoAccess={false}
  fallback={<div>Access Denied</div>}
>
  <ExpensiveFinancialComponent />
</ProtectedElement>
```

**Features**:
- `hideIfNoAccess`: Controls whether to hide element or show fallback
- `fallback`: Custom component to show when access is denied
- Lightweight - doesn't render unauthorized content

## Protected Pages

### Superuser-Only Pages
These pages require `requireSuperuser={true}`:

1. **Security Settings** (`/security`)
   - Password management
   - Two-factor authentication
   - Security audit logs

2. **System Settings** (`/settings`)
   - Global application settings
   - User management interface
   - System configuration

### Permission-Based Pages
These pages require specific permissions:

1. **Sales Validation** (`/validate-sales`)
   - **Required Permission**: `VALIDATE_SALES`
   - **Access**: Staff+ (Superuser and Staff roles)

2. **Reports** (`/reports`)
   - **Required Permission**: `VIEW_REPORTS`
   - **Access**: All authenticated users (but content may vary by role)

3. **Inventory Settings** (`/inventory/settings`)
   - **Required Permission**: `VIEW_INVENTORY_SETTINGS`
   - **Access**: Superuser only

## Protected UI Elements

### Financial Operations
- **Export Button** (Reports page): `VIEW_FINANCIAL_DATA`
- **Record Payment Button** (Payment Modal): `VIEW_FINANCIAL_DATA`

### Customer Management
- **Add Customer Button**: `EDIT_CUSTOMER_DETAILS`
- **Edit Customer Button**: `EDIT_CUSTOMER_DETAILS`
- **Delete Customer Button**: `EDIT_CUSTOMER_DETAILS`

### Price Management
- **Edit Price Button** (Price Modal): `EDIT_PRICES`

## Testing the RBAC System

### Current Test User
The system is configured with a test superuser:
```typescript
// src/data/user.ts
export const loggedInUser: User = {
  id: 1,
  name: "Ada Okafor",
  email: "ada.okafor@example.com",
  username: "adaokafor",
  is_staff: true,
  is_superuser: true
};
```

### Testing Different Access Levels

#### 1. Testing as Superuser (Current Default)
- Should have access to all pages and UI elements
- No permission restrictions should apply

#### 2. Testing as Staff User
To test staff-level access, modify `src/data/user.ts`:
```typescript
export const loggedInUser: User = {
  // ... other properties
  is_staff: true,
  is_superuser: false  // Change this to false
};
```

**Expected Behavior**:
- ✅ Access: Reports, Customer management, Stock management, Returns processing
- ❌ Blocked: Security settings, System settings, Inventory settings, Price editing, Financial data export

#### 3. Testing as Regular User
To test regular user access, modify `src/data/user.ts`:
```typescript
export const loggedInUser: User = {
  // ... other properties
  is_staff: false,     // Change this to false
  is_superuser: false  // Change this to false
};
```

**Expected Behavior**:
- ✅ Access: Basic reports (read-only)
- ❌ Blocked: All other pages and most UI elements

### Manual Testing Checklist

#### Page Access Tests
- [ ] Navigate to `/security` - should show appropriate access control
- [ ] Navigate to `/settings` - should show appropriate access control
- [ ] Navigate to `/validate-sales` - should show appropriate access control
- [ ] Navigate to `/reports` - should show appropriate access control
- [ ] Navigate to `/inventory/settings` - should show appropriate access control

#### UI Element Tests
- [ ] Check Export button visibility in Reports page
- [ ] Check Record Payment button in Payment modal
- [ ] Check Customer management buttons (Add/Edit/Delete)
- [ ] Check Edit Price button in Price modal

#### Error Handling Tests
- [ ] Verify appropriate error messages for different access levels
- [ ] Test "Go Back" functionality on access denied pages
- [ ] Verify graceful fallbacks for protected elements

## Error Handling

### Access Denied Scenarios

#### 1. Unauthenticated User
- **Trigger**: User is not logged in (`user` is null)
- **Response**: Red-themed access denied screen with lock icon
- **Message**: "Access Denied - Please log in to continue"

#### 2. Insufficient Superuser Privileges
- **Trigger**: Page requires superuser but user is not superuser
- **Response**: Red-themed screen with shield icon
- **Message**: "Superuser Access Required"

#### 3. Missing Specific Permission
- **Trigger**: Page/element requires specific permission user doesn't have
- **Response**: Orange-themed screen with shield-X icon
- **Message**: "Insufficient Permissions - You don't have the required permission: [PERMISSION_NAME]"

### Fallback Options
- All protected routes include "Go Back" buttons
- ProtectedElement supports custom fallback components
- Graceful degradation ensures app remains functional

## Implementation Best Practices

### 1. Use Appropriate Protection Level
- Use `ProtectedRoute` for entire pages
- Use `ProtectedElement` for individual UI components
- Prefer specific permissions over role-based checks when possible

### 2. Provide Good User Experience
- Always include meaningful error messages
- Provide navigation alternatives when access is denied
- Use loading states appropriately

### 3. Security Considerations
- Always validate permissions on both frontend and backend
- Don't rely solely on UI hiding for security
- Implement proper API-level authorization

### 4. Maintainability
- Keep permission definitions centralized in AuthContext
- Use descriptive permission names
- Document permission mappings clearly

## Future Enhancements

### Potential Improvements
1. **Dynamic Permission Loading**: Load permissions from API instead of hardcoding
2. **Permission Groups**: Create logical groupings of permissions
3. **Audit Logging**: Track permission checks and access attempts
4. **Role Management UI**: Admin interface for managing roles and permissions
5. **Time-based Permissions**: Permissions that expire or are time-limited
6. **Context-aware Permissions**: Permissions that depend on data context (e.g., "edit own profile")

### Database Integration
When integrating with a real backend:
1. Store user permissions in database
2. Implement permission caching strategies
3. Add permission inheritance and hierarchy
4. Support for custom roles and permission sets

## Conclusion

The RBAC system provides comprehensive access control for the POS application with:
- ✅ Page-level protection with ProtectedRoute
- ✅ Element-level protection with ProtectedElement  
- ✅ Hierarchical permission system (Superuser > Staff > Regular User)
- ✅ Graceful error handling and user feedback
- ✅ Extensible permission architecture
- ✅ Good user experience with meaningful error messages

The implementation is production-ready and provides a solid foundation for secure access control in the application.
