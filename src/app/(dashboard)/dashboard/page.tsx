import { AlertCircle } from "lucide-react";
import {
  WithAuth,
  type WithAuthComponentProps,
} from "@/components/global/authorization/withPermissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DashboardPage(_props: WithAuthComponentProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Roles</CardTitle>
            <CardDescription>System roles defined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Currently logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
          </CardContent>
        </Card>
      </div>
      <Card className="min-h-screen flex-1 md:min-h-min">
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>
            Welcome to your management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <AlertCircle className="size-5" />
            <p>Dashboard content will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WithAuth(DashboardPage, { permission: "dashboard.view" });
