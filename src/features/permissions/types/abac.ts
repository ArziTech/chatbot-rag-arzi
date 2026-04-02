/**
 * ABAC (Attribute-Based Access Control) Type System
 *
 * This module defines the type-safe permission structure for ABAC.
 * Permissions are defined by resource and action pairs, with optional
 * data context for attribute-based checks.
 */

// User attributes for ABAC evaluation
export interface ABACUser {
  id: string;
  roles: string[];
  blockedBy?: string[];
}

// Data type for users resource
export interface UserData {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

// Data type for roles resource
export interface RoleData {
  id: number;
  name: string;
  description: string | null;
  byPassAllFeatures: boolean;
  [key: string]: unknown;
}

// Data type for comments (example ABAC resource)
export interface CommentData {
  id: string;
  body: string;
  authorId: string;
  createdAt: Date;
  [key: string]: unknown;
}

// Data type for todos (example ABAC resource)
export interface TodoData {
  id: string;
  title: string;
  userId: string;
  completed: boolean;
  invitedUsers: string[];
  [key: string]: unknown;
}

/**
 * Permissions type defines all resources and their available actions.
 * Add new resources here to extend the permission system.
 *
 * Each resource has:
 * - dataType: The TypeScript type for the resource (used for ABAC context)
 * - action: Union of valid action strings for that resource
 */
export interface Permissions {
  users: {
    dataType: UserData;
    action: "view" | "create" | "edit" | "delete";
  };
  roles: {
    dataType: RoleData;
    action: "view" | "create" | "edit" | "delete";
  };
  comments: {
    dataType: CommentData;
    action: "view" | "create" | "update" | "delete";
  };
  dashboard: {
    dataType: null;
    action: "view";
  };
  permissions: {
    dataType: null;
    action: "view" | "manage";
  };
  settings: {
    dataType: null;
    action: "view";
  };
}

/**
 * PermissionCheck represents either a static boolean or a dynamic function
 * that evaluates permissions based on user and resource attributes.
 *
 * - `true` or `false`: Static permission (always allowed/denied)
 * - `(user, data) => boolean`: Dynamic ABAC permission (context-aware)
 */
export type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: ABACUser, data: Permissions[Key]["dataType"]) => boolean);

/**
 * RolePermissions maps each role to their permission configuration.
 * Used with `as const satisfies` for compile-time validation.
 */
export type RolePermissions = {
  [Resource in keyof Permissions]?: {
    [Action in Permissions[Resource]["action"]]?: PermissionCheck<Resource>;
  };
};

/**
 * Type utility to get the data type for a given resource
 */
export type ResourceDataType<Resource extends keyof Permissions> =
  Permissions[Resource]["dataType"];

/**
 * Type utility to get the action type for a given resource
 */
export type ResourceAction<Resource extends keyof Permissions> =
  Permissions[Resource]["action"];
