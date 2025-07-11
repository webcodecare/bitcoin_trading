import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Users, UserPlus, Shield, Crown, UserCheck, Search } from "lucide-react";

export default function AdminUserRoles() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockUsers = [
    {
      id: "1",
      email: "admin@demo.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
    },
    {
      id: "2", 
      email: "superadmin@demo.com",
      firstName: "Super",
      lastName: "Admin", 
      role: "superuser",
      isActive: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin User Management</h1>
              <p className="text-muted-foreground">
                Manage administrator accounts and role assignments
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              {mockUsers.length} Admin Users
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active administrators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter(u => u.role === 'admin').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard admin access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter(u => u.role === 'superuser').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Full system access
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUsers.filter(u => u.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admin users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Users List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Administrator Accounts</CardTitle>
                  <CardDescription>
                    Manage admin user accounts and their role assignments
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers
                  .filter(user => 
                    !searchTerm || 
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <Card key={user.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {user.role === 'superuser' ? (
                                <Crown className="h-5 w-5 text-purple-500" />
                              ) : (
                                <Shield className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={user.role === 'superuser' ? 'default' : 'secondary'}
                              className={user.role === 'superuser' ? 'bg-purple-500' : ''}
                            >
                              {user.role === 'superuser' ? 'Super Admin' : 'Admin'}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Role Definitions</CardTitle>
              <CardDescription>
                Understanding administrator roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Administrator
                    </CardTitle>
                    <CardDescription>Standard administrative access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">• User management</div>
                      <div className="text-sm">• Content management</div>
                      <div className="text-sm">• View analytics</div>
                      <div className="text-sm">• Signal management</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      Super Administrator
                    </CardTitle>
                    <CardDescription>Complete system control</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">• All administrator permissions</div>
                      <div className="text-sm">• System configuration</div>
                      <div className="text-sm">• Role management</div>
                      <div className="text-sm">• Full database access</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}