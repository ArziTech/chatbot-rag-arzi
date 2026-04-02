import { Save } from "lucide-react";
import { WithAuth } from "@/components/global/authorization/withPermissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your application preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="Next.js Starter Kit" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-url">Application URL</Label>
            <Input id="app-url" defaultValue="http://localhost:3000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" defaultValue="support@example.com" />
          </div>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 size-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WithAuth(SettingsPage, { permission: "settings.view" });
