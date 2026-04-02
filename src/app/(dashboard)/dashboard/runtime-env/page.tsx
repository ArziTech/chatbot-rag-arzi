import { WithAuth } from "@/components/global/authorization/withPermissions";
import { RuntimeEnvClient } from "./runtime-env-client";

function RuntimeEnvPage() {
  return <RuntimeEnvClient />;
}

export default WithAuth(RuntimeEnvPage, { permission: "settings.manage" });
