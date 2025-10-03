import React from 'react';

export type Permission = 
  | 'all'
  | 'dashboard'
  | 'students'
  | 'staff'
  | 'admission'
  | 'fees'
  | 'exam'
  | 'library'
  | 'classes'
  | 'timetable'
  | 'attendance'
  | 'health'
  | 'accounts'
  | 'transport'
  | 'hostel'
  | 'communication'
  | 'reports'
  | 'certificates'
  | 'sports'
  | 'alumni'
  | 'birthday'
  | 'inventory'
  | 'settings'
  | 'management'
  | 'academic'
  | 'grades'
  | 'profile';

export type Role = 'admin' | 'principal' | 'teacher' | 'student' | 'accountant' | 'librarian' | 'staff' | 'parent';

export const rolePermissions: Record<Role, Permission[]> = {
  admin: ['all'],
  principal: [
    'dashboard', 'students', 'staff', 'admission', 'classes', 'timetable', 
    'attendance', 'exam', 'reports', 'certificates', 'academic', 'management',
    'sports', 'alumni', 'communication', 'health', 'settings'
  ],
  teacher: [
    'dashboard', 'students', 'attendance', 'grades', 'exam', 'timetable',
    'communication', 'library', 'health', 'profile', 'classes'
  ],
  student: [
    'dashboard', 'profile', 'grades', 'library', 'timetable', 'health',
    'fees', 'certificates', 'sports', 'communication'
  ],
  accountant: [
    'dashboard', 'fees', 'accounts', 'reports', 'students', 'profile'
  ],
  librarian: [
    'dashboard', 'library', 'students', 'reports', 'profile'
  ],
  staff: [
    'dashboard', 'profile', 'communication', 'students'
  ],
  parent: [
    'dashboard', 'profile', 'students', 'fees', 'attendance', 'grades',
    'health', 'communication', 'timetable', 'library'
  ]
};

export class PermissionManager {
  private userRole: Role;
  private userPermissions: Permission[];

  constructor(role: Role, customPermissions?: Permission[]) {
    this.userRole = role;
    this.userPermissions = customPermissions || rolePermissions[role] || [];
  }

  hasPermission(permission: Permission): boolean {
    // Admin has all permissions
    if (this.userPermissions.includes('all')) {
      return true;
    }

    return this.userPermissions.includes(permission);
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  getAccessibleRoutes(): string[] {
    const routePermissionMap: Record<string, Permission> = {
      'dashboard': 'dashboard',
      'management': 'management',
      'students': 'students',
      'staff': 'staff',
      'admission': 'admission',
      'fees': 'fees',
      'exam': 'exam',
      'library': 'library',
      'classes': 'classes',
      'timetable': 'timetable',
      'attendance': 'attendance',
      'health': 'health',
      'accounts': 'accounts',
      'transport': 'transport',
      'hostel': 'hostel',
      'communication': 'communication',
      'reports': 'reports',
      'certificates': 'certificates',
      'sports': 'sports',
      'alumni': 'alumni',
      'birthday': 'birthday',
      'inventory': 'inventory',
      'settings': 'settings'
    };

    return Object.entries(routePermissionMap)
      .filter(([_, permission]) => this.hasPermission(permission))
      .map(([route, _]) => route);
  }

  canCreate(resource: Permission): boolean {
    const createPermissions: Record<Permission, Permission[]> = {
      'students': ['students', 'admission'],
      'staff': ['staff'],
      'classes': ['classes', 'academic'],
      'fees': ['fees', 'accounts'],
      'exam': ['exam', 'academic'],
      'library': ['library'],
      'attendance': ['attendance'],
      'reports': ['reports'],
      'communication': ['communication'],
      'all': ['all']
    } as Record<Permission, Permission[]>;

    const requiredPermissions = createPermissions[resource] || [resource];
    return this.hasAnyPermission(requiredPermissions);
  }

  canEdit(resource: Permission): boolean {
    return this.canCreate(resource); // Same logic for now
  }

  canDelete(resource: Permission): boolean {
    // Stricter permissions for deletion
    const deletePermissions: Record<Permission, Permission[]> = {
      'students': ['students', 'all'],
      'staff': ['staff', 'all'],
      'classes': ['classes', 'all'],
      'fees': ['fees', 'all'],
      'exam': ['exam', 'all'],
      'library': ['library', 'all'],
      'all': ['all']
    } as Record<Permission, Permission[]>;

    const requiredPermissions = deletePermissions[resource] || ['all'];
    return this.hasAnyPermission(requiredPermissions);
  }

  canViewFinancial(): boolean {
    return this.hasAnyPermission(['fees', 'accounts', 'all']);
  }

  canViewReports(): boolean {
    return this.hasAnyPermission(['reports', 'all']);
  }

  canManageSystem(): boolean {
    return this.hasAnyPermission(['management', 'settings', 'all']);
  }

  getRestrictedMessage(): string {
    return `Access denied. Your role (${this.userRole}) doesn't have permission to access this resource.`;
  }

  getUserRole(): Role {
    return this.userRole;
  }

  getUserPermissions(): Permission[] {
    return this.userPermissions;
  }
}

// Hook for using permissions in components
export function usePermissions(userRole?: Role, customPermissions?: Permission[]) {
  if (!userRole) {
    return new PermissionManager('student'); // Default to student role
  }
  
  return new PermissionManager(userRole, customPermissions);
}

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission,
  fallback?: React.ComponentType<any>
) {
  return function PermissionWrapper(props: P & { userRole?: Role; userPermissions?: Permission[] }) {
    const { userRole = 'student', userPermissions, ...componentProps } = props;
    const permissions = new PermissionManager(userRole, userPermissions);

    if (permissions.hasPermission(requiredPermission)) {
      return <Component {...(componentProps as P)} />;
    }

    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
          <p className="text-gray-600">{permissions.getRestrictedMessage()}</p>
        </div>
      </div>
    );
  };
}

// Permission gate component
export function PermissionGate({ 
  permission, 
  userRole, 
  userPermissions,
  children, 
  fallback 
}: {
  permission: Permission;
  userRole?: Role;
  userPermissions?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permissions = new PermissionManager(userRole || 'student', userPermissions);

  if (permissions.hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback || null}</>;
}