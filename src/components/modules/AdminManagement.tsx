import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { api } from '../../utils/api';
import {
  Plus, Search, Eye, Edit, Trash2, Shield, Users, UserCheck,
  Activity, Database, Lock, Unlock, Key,
  Download, RefreshCw, ShieldCheck, Archive, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian';
  department?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  lastLogin?: string;
  loginAttempts: number;
  permissions: string[];
  created_at: string;
  updated_at?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  usersCount: number;
  isSystem: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  actions: string[];
  description: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  timestamp: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  totalUsers: number;
  uptime: string;
  lastBackup: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface BackupRecord {
  id: string;
  type: 'manual' | 'scheduled';
  status: 'completed' | 'in_progress' | 'failed';
  size: string;
  duration: string;
  createdBy: string;
  timestamp: string;
  downloadUrl?: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordExpiry: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  requireStrongPassword: boolean;
  minPasswordLength: number;
}

interface SystemConfiguration {
  maintenanceMode: boolean;
  debugMode: boolean;
  apiRateLimit: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalRoles: number;
  failedLogins: number;
  systemUptime: string;
  lastSystemUpdate: string;
  pendingApprovals: number;
}

export function AdminManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    totalUsers: 0,
    uptime: '',
    lastBackup: '',
    systemHealth: 'healthy'
  });
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    requireStrongPassword: true,
    minPasswordLength: 8
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    maintenanceMode: false,
    debugMode: false,
    apiRateLimit: 100,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'en'
  });
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalRoles: 0,
    failedLogins: 0,
    systemUptime: '',
    lastSystemUpdate: '',
    pendingApprovals: 0
  });

  const [loading, setLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
    department: '',
    permissions: [] as string[]
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadSystemMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [
        usersData,
        rolesData,
        permissionsData,
        auditData,
        metricsData,
        backupsData,
        statsData
      ] = await Promise.all([
        api.getAdminUsers(),
        api.getRoles(),
        api.getPermissions(),
        api.getAuditLogs(),
        api.getSystemMetrics(),
        api.getBackupRecords(),
        api.getAdminStats()
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setAuditLogs(auditData);
      setSystemMetrics(metricsData);
      setBackupRecords(backupsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const metrics = await api.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const userData = {
        ...newUser,
        status: 'active',
        loginAttempts: 0,
        permissions: newUser.permissions
      };
      
      await api.createAdminUser(userData);
      toast.success('User created successfully');
      setIsAddUserDialogOpen(false);
      resetUserForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create user');
      console.error(error);
    }
  };

  const handleAddRole = async () => {
    try {
      const roleData = {
        ...newRole,
        usersCount: 0,
        isSystem: false
      };
      
      await api.createRole(roleData);
      toast.success('Role created successfully');
      setIsAddRoleDialogOpen(false);
      resetRoleForm();
      loadData();
    } catch (error) {
      toast.error('Failed to create role');
      console.error(error);
    }
  };


  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.deleteAdminUser(userId);
      toast.success('User deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await api.resetUserPassword(userId);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error('Failed to reset password');
      console.error(error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateAdminUser(userId, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const handleBackupNow = async () => {
    try {
      await api.createBackup();
      toast.success('Backup initiated successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to create backup');
      console.error(error);
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      await api.updateSecuritySettings(securitySettings);
      toast.success('Security settings updated');
    } catch (error) {
      toast.error('Failed to update security settings');
      console.error(error);
    }
  };

  const handleSaveSystemConfig = async () => {
    try {
      await api.updateSystemConfiguration(systemConfig);
      toast.success('System configuration updated');
    } catch (error) {
      toast.error('Failed to update system configuration');
      console.error(error);
    }
  };

  const resetUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      role: 'teacher',
      department: '',
      permissions: []
    });
  };

  const resetRoleForm = () => {
    setNewRole({
      name: '',
      description: '',
      permissions: []
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'parent': return 'bg-yellow-100 text-yellow-800';
      case 'accountant': return 'bg-orange-100 text-orange-800';
      case 'librarian': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === '' || user.role === roleFilter) &&
      (statusFilter === '' || user.status === statusFilter)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">
            System administration, user management, and security controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBackupNow}>
            <Download className="mr-2 h-4 w-4" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+{stats.newUsersToday} today</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="mt-2" />
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemMetrics.systemHealth)}`}>
                  {systemMetrics.systemHealth.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">Uptime: {systemMetrics.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Security</p>
                <p className="text-2xl font-bold">{stats.failedLogins}</p>
                <p className="text-xs text-muted-foreground">Failed logins today</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          {/* User Management Tab Content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with specific roles and permissions
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                            placeholder="Confirm password"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={newUser.role} onValueChange={(value: string) => setNewUser({...newUser, role: value as 'admin' | 'principal' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian'})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="principal">Principal</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="accountant">Accountant</SelectItem>
                              <SelectItem value="librarian">Librarian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={newUser.department}
                            onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                            placeholder="Enter department (optional)"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser}>
                        Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {(user.firstName || '?')[0]}{(user.lastName || '?')[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.department || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // TODO: Implement view user dialog
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(user.id, user.status)}
                              >
                                {user.status === 'active' ? 
                                  <Lock className="h-4 w-4" /> : 
                                  <Unlock className="h-4 w-4" />
                                }
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetPassword(user.id)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="space-y-4">
          {/* Roles Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Role Management</CardTitle>
              <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>
                      Define a new role with specific permissions
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                        placeholder="Enter role name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="roleDescription">Description</Label>
                      <Textarea
                        id="roleDescription"
                        value={newRole.description}
                        onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                        placeholder="Enter role description"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRole}>
                      Create Role
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">{role.name}</h4>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {role.usersCount} users
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-4 w-4" />
                              {role.permissions.length} permissions
                            </span>
                            {role.isSystem && (
                              <Badge variant="secondary">System Role</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!role.isSystem && (
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          {/* Permissions Management */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  permissions.reduce((acc, permission) => {
                    if (!acc[permission.module]) {
                      acc[permission.module] = [];
                    }
                    acc[permission.module].push(permission);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([module, modulePermissions]) => (
                  <Card key={module}>
                    <CardHeader className="py-3">
                      <h4 className="font-semibold capitalize">{module}</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox id={permission.id} />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked: boolean) =>
                        setSecuritySettings({...securitySettings, twoFactorAuth: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Strong Password Required</Label>
                      <p className="text-sm text-muted-foreground">Enforce password complexity</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireStrongPassword}
                      onCheckedChange={(checked: boolean) =>
                        setSecuritySettings({...securitySettings, requireStrongPassword: checked})
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={securitySettings.minPasswordLength}
                      onChange={(e) => 
                        setSecuritySettings({...securitySettings, minPasswordLength: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Password Expiry (days)</Label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => 
                        setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => 
                        setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => 
                        setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>IP Whitelist</Label>
                    <Textarea
                      placeholder="Enter IP addresses (one per line)"
                      value={securitySettings.ipWhitelist.join('\n')}
                      onChange={(e) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          ipWhitelist: e.target.value.split('\n').filter(ip => ip)
                        })
                      }
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSecuritySettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Disable user access temporarily</p>
                    </div>
                    <Switch
                      checked={systemConfig.maintenanceMode}
                      onCheckedChange={(checked: boolean) =>
                        setSystemConfig({...systemConfig, maintenanceMode: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                    </div>
                    <Switch
                      checked={systemConfig.debugMode}
                      onCheckedChange={(checked: boolean) =>
                        setSystemConfig({...systemConfig, debugMode: checked})
                      }
                    />
                  </div>
                  
                  <div>
                    <Label>API Rate Limit (requests/minute)</Label>
                    <Input
                      type="number"
                      value={systemConfig.apiRateLimit}
                      onChange={(e) => 
                        setSystemConfig({...systemConfig, apiRateLimit: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={systemConfig.maxFileSize}
                      onChange={(e) => 
                        setSystemConfig({...systemConfig, maxFileSize: parseInt(e.target.value)})
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={systemConfig.timezone}
                      onValueChange={(value: string) => setSystemConfig({...systemConfig, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Date Format</Label>
                    <Select
                      value={systemConfig.dateFormat}
                      onValueChange={(value: string) => setSystemConfig({...systemConfig, dateFormat: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={systemConfig.currency}
                      onValueChange={(value: string) => setSystemConfig({...systemConfig, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={systemConfig.language}
                      onValueChange={(value: string) => setSystemConfig({...systemConfig, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSystemConfig}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          {/* Backup Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Backup Management</CardTitle>
              <Button onClick={handleBackupNow}>
                <Archive className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupRecords.map((backup) => (
                  <Card key={backup.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Backup #{backup.id}</span>
                                <Badge className={getStatusColor(backup.status)}>
                                  {backup.status}
                                </Badge>
                                <Badge variant="outline">{backup.type}</Badge>
                              </div>
                              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                <span>Size: {backup.size}</span>
                                <span>Duration: {backup.duration}</span>
                                <span>Created by: {backup.createdBy}</span>
                                <span>{new Date(backup.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {backup.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4">
          {/* System Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm">{systemMetrics.cpu}%</span>
                  </div>
                  <Progress value={systemMetrics.cpu} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm">{systemMetrics.memory}%</span>
                  </div>
                  <Progress value={systemMetrics.memory} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm">{systemMetrics.disk}%</span>
                  </div>
                  <Progress value={systemMetrics.disk} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Network Usage</span>
                    <span className="text-sm">{systemMetrics.network}%</span>
                  </div>
                  <Progress value={systemMetrics.network} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Health</span>
                  <Badge className={getStatusColor(systemMetrics.systemHealth)}>
                    {systemMetrics.systemHealth}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="font-medium">{systemMetrics.activeUsers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="font-medium">{systemMetrics.totalUsers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Uptime</span>
                  <span className="font-medium">{systemMetrics.uptime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="font-medium">{systemMetrics.lastBackup}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}