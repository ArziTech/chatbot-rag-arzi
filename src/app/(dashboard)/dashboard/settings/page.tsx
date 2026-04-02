import { WithAuth } from "@/components/global/authorization/withPermissions";
import { SettingsForm } from "./settings-form";

function SettingsPage() {
  return <SettingsForm />;
}

export default WithAuth(SettingsPage, { permission: "settings.view" });
