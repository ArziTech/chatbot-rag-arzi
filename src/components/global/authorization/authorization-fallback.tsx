"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FallbackType = "unauthorized" | "unauthenticated";

interface AuthorizationFallbackProps {
  type?: FallbackType;
}

export function AuthorizationFallback({
  type = "unauthorized",
}: AuthorizationFallbackProps) {
  const router = useRouter();

  const isUnauthorized = type === "unauthorized";
  const title = isUnauthorized ? "Access Denied" : "Authentication Required";
  const description = isUnauthorized
    ? "You do not have permission to view this page."
    : "Please log in to continue.";
  const actionLabel = isUnauthorized ? "Go to Dashboard" : "Go to Login";

  const handleAction = () => {
    if (isUnauthorized) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 pt-0">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {isUnauthorized
              ? "Contact your administrator if you believe this is an error."
              : "Your session may have expired. Please log in again."}
          </p>
          <Button onClick={handleAction} variant="default">
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
