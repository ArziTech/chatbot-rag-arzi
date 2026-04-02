import { WithAuth } from "@/components/global/authorization/withPermissions";
import { PermissionsClient } from "./permissions-client";

// Wrapper component for the HOC
function PermissionsPage() {
  return <PermissionsClient />;
}

export default WithAuth(PermissionsPage, { permission: "permission.view" });
