"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Permission, UserPermissions } from "@/features/permissions";

interface PermissionContextValue {
  permissions: Permission[];
  byPassAllFeatures: boolean;
  isLoading: boolean;
  error?: Error | null;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(
  undefined,
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [byPassAllFeatures, setByPassAllFeatures] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/permissions/me");
        if (!res.ok) {
          throw new Error("Failed to fetch permissions");
        }
        const data: UserPermissions = await res.json();
        setPermissions(data.permissions || []);
        setByPassAllFeatures(data.byPassAllFeatures || false);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        setError(err as Error);
        setPermissions([]);
        setByPassAllFeatures(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const value: PermissionContextValue = {
    permissions,
    byPassAllFeatures,
    isLoading,
    error,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
