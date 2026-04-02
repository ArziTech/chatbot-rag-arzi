import { Plus, Trash2, UserPen } from "lucide-react";
import { WithAuth } from "@/components/global/authorization/withPermissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/features/permissions";

const mockRoles = [
  {
    id: 1,
    name: "SUPERADMIN",
    description: "Super administrator with full bypass access",
    users: 1,
  },
  {
    id: 2,
    name: "ADMIN",
    description: "Administrator with management access",
    users: 1,
  },
  {
    id: 3,
    name: "USER",
    description: "Regular user with limited access",
    users: 1,
  },
];

function RolesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage system roles and permissions
          </p>
        </div>
        <PermissionGate permission="role.create">
          <Button>
            <Plus className="mr-2 size-4" />
            Add Role
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>A list of all roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.users}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PermissionGate permission="role.edit">
                        <Button variant="ghost" size="icon">
                          <UserPen className="size-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="role.delete">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default WithAuth(RolesPage, { permission: "role.view" });
