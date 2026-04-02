"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { UserPreferences, UpdatePreferencesInput } from "@/features/settings/types";

interface UserPreferencesContextValue {
  preferences: UserPreferences | null;
  isLoading: boolean;
  updatePreferences: (data: UpdatePreferencesInput) => Promise<void>;
  refetch: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(
  undefined
);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/user/preferences");
      const data = await res.json();
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const updatePreferences = async (data: UpdatePreferencesInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setPreferences(result.data);
      } else {
        throw new Error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{ preferences, isLoading, updatePreferences, refetch: fetchPreferences }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesProvider"
    );
  }
  return context;
}
