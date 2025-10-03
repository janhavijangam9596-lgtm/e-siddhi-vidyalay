// Data Synchronization Utility for Dashboard to Database Updates
// Handles batch updates across multiple tables with proper error handling and audit logging

import { api } from './api';

export interface DashboardData {
  totalStudents: number;
  totalClasses: number;
  pendingAdmissions: number;
  totalFees: number;
  activeTeachers?: number;
  totalBooks?: number;
  attendanceRate?: number;
  feesCollectionRate?: number;
  monthlyRevenue?: number;
  totalExpenses?: number;
  newAdmissions?: number;
  graduatedStudents?: number;
}

export interface SyncResult {
  success: boolean;
  updatedTables: string[];
  failedTables: string[];
  errors: string[];
  auditLog: AuditEntry[];
  totalRecordsUpdated: number;
  executionTime: number;
}

export interface AuditEntry {
  timestamp: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface TableMapping {
  tableName: string;
  primaryKey: string;
  fields: FieldMapping[];
  dependencies?: string[]; // Tables that must be updated before this one
  validationRules?: ValidationRule[];
}

export interface FieldMapping {
  dashboardField: keyof DashboardData;
  dbColumn: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'range' | 'custom';
  value?: any;
  customValidator?: (value: any) => boolean;
  errorMessage: string;
}

class DataSyncService {
  private auditLog: AuditEntry[] = [];
  private tableMappings: TableMapping[] = [];

  constructor() {
    this.initializeTableMappings();
  }

  private initializeTableMappings() {
    this.tableMappings = [
      {
        tableName: 'school_stats',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'totalStudents', dbColumn: 'total_students', required: true },
          { dashboardField: 'totalClasses', dbColumn: 'total_classes', required: true },
          { dashboardField: 'pendingAdmissions', dbColumn: 'pending_admissions', required: true },
          { dashboardField: 'totalFees', dbColumn: 'total_fees_collected', required: true },
          { dashboardField: 'activeTeachers', dbColumn: 'active_teachers' },
          { dashboardField: 'totalBooks', dbColumn: 'total_books' },
          { dashboardField: 'attendanceRate', dbColumn: 'attendance_rate' },
          { dashboardField: 'feesCollectionRate', dbColumn: 'fees_collection_rate' },
          { dashboardField: 'monthlyRevenue', dbColumn: 'monthly_revenue' },
          { dashboardField: 'totalExpenses', dbColumn: 'total_expenses' },
          { dashboardField: 'newAdmissions', dbColumn: 'new_admissions_this_month' },
          { dashboardField: 'graduatedStudents', dbColumn: 'graduated_students' }
        ],
        validationRules: [
          { field: 'total_students', rule: 'min', value: 0, errorMessage: 'Total students cannot be negative' },
          { field: 'total_classes', rule: 'min', value: 0, errorMessage: 'Total classes cannot be negative' },
          { field: 'attendance_rate', rule: 'range', value: { min: 0, max: 100 }, errorMessage: 'Attendance rate must be between 0 and 100' }
        ]
      },
      {
        tableName: 'students',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'totalStudents', dbColumn: 'total_count', transform: (value) => ({ total_count: value }) }
        ],
        dependencies: ['school_stats']
      },
      {
        tableName: 'classes',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'totalClasses', dbColumn: 'total_count', transform: (value) => ({ total_count: value }) }
        ],
        dependencies: ['school_stats']
      },
      {
        tableName: 'fees',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'totalFees', dbColumn: 'total_collected', transform: (value) => ({ total_collected: value }) },
          { dashboardField: 'feesCollectionRate', dbColumn: 'collection_rate', transform: (value) => ({ collection_rate: value }) }
        ],
        dependencies: ['school_stats']
      },
      {
        tableName: 'teachers',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'activeTeachers', dbColumn: 'active_count', transform: (value) => ({ active_count: value }) }
        ],
        dependencies: ['school_stats']
      },
      {
        tableName: 'library',
        primaryKey: 'id',
        fields: [
          { dashboardField: 'totalBooks', dbColumn: 'total_books', transform: (value) => ({ total_books: value }) }
        ],
        dependencies: ['school_stats']
      }
    ];
  }

  /**
   * Main synchronization method
   */
  async synchronizeDashboardData(dashboardData: DashboardData, userId?: string): Promise<SyncResult> {
    const startTime = Date.now();
    this.auditLog = [];

    try {
      // Validate input data
      this.validateDashboardData(dashboardData);

      // Get current database state
      const currentData = await this.getCurrentDatabaseState();

      // Calculate changes
      const changes = this.calculateChanges(dashboardData, currentData);

      // Execute updates in dependency order
      const result = await this.executeBatchUpdates(changes, userId);

      const executionTime = Date.now() - startTime;

      return {
        success: result.failedTables.length === 0,
        updatedTables: result.updatedTables,
        failedTables: result.failedTables,
        errors: result.errors,
        auditLog: this.auditLog,
        totalRecordsUpdated: result.totalRecordsUpdated,
        executionTime
      };

    } catch (error: any) {
      this.logAuditEntry({
        timestamp: new Date().toISOString(),
        table: 'system',
        operation: 'UPDATE',
        status: 'failed',
        error: error.message,
        userId
      });

      return {
        success: false,
        updatedTables: [],
        failedTables: [],
        errors: [error.message],
        auditLog: this.auditLog,
        totalRecordsUpdated: 0,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Validate dashboard data before processing
   */
  private validateDashboardData(data: DashboardData): void {
    const errors: string[] = [];

    // Basic validation
    if (data.totalStudents < 0) errors.push('Total students cannot be negative');
    if (data.totalClasses < 0) errors.push('Total classes cannot be negative');
    if (data.totalFees < 0) errors.push('Total fees cannot be negative');
    if (data.attendanceRate !== undefined && (data.attendanceRate < 0 || data.attendanceRate > 100)) {
      errors.push('Attendance rate must be between 0 and 100');
    }
    if (data.feesCollectionRate !== undefined && (data.feesCollectionRate < 0 || data.feesCollectionRate > 100)) {
      errors.push('Fees collection rate must be between 0 and 100');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get current state from database
   */
  private async getCurrentDatabaseState(): Promise<Record<string, any>> {
    try {
      // Try to get data from API
      const stats = await api.getDashboardStats();
      return {
        school_stats: stats,
        students: { total_count: stats.totalStudents },
        classes: { total_count: stats.totalClasses },
        fees: { total_collected: stats.totalFees, collection_rate: stats.feesCollectionRate },
        teachers: { active_count: stats.activeTeachers },
        library: { total_books: stats.totalBooks }
      };
    } catch (error) {
      // Return empty state if API fails
      console.warn('Could not fetch current database state, using empty state');
      return {};
    }
  }

  /**
   * Calculate what needs to be changed
   */
  private calculateChanges(newData: DashboardData, currentData: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};

    for (const mapping of this.tableMappings) {
      const tableChanges: any = {};
      let hasChanges = false;

      for (const field of mapping.fields) {
        const newValue = newData[field.dashboardField];
        const currentValue = currentData[mapping.tableName]?.[field.dbColumn];

        if (newValue !== undefined && newValue !== currentValue) {
          const transformedValue = field.transform ? field.transform(newValue) : newValue;
          tableChanges[field.dbColumn] = transformedValue;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        changes[mapping.tableName] = {
          ...tableChanges,
          updated_at: new Date().toISOString()
        };
      }
    }

    return changes;
  }

  /**
   * Execute batch updates with proper ordering and error handling
   */
  private async executeBatchUpdates(changes: Record<string, any>, userId?: string): Promise<{
    updatedTables: string[];
    failedTables: string[];
    errors: string[];
    totalRecordsUpdated: number;
  }> {
    const updatedTables: string[] = [];
    const failedTables: string[] = [];
    const errors: string[] = [];
    let totalRecordsUpdated = 0;

    // Sort tables by dependencies
    const sortedTables = this.sortTablesByDependencies(Object.keys(changes));

    for (const tableName of sortedTables) {
      try {
        const tableChanges = changes[tableName];
        const mapping = this.tableMappings.find(m => m.tableName === tableName);

        if (!mapping) {
          throw new Error(`No mapping found for table: ${tableName}`);
        }

        // Validate table data
        this.validateTableData(tableName, tableChanges);

        // Execute update
        await this.updateTable(tableName, tableChanges);

        updatedTables.push(tableName);
        totalRecordsUpdated++;

        this.logAuditEntry({
          timestamp: new Date().toISOString(),
          table: tableName,
          operation: 'UPDATE',
          status: 'success',
          newValues: tableChanges,
          userId
        });

      } catch (error: any) {
        failedTables.push(tableName);
        errors.push(`${tableName}: ${error.message}`);

        this.logAuditEntry({
          timestamp: new Date().toISOString(),
          table: tableName,
          operation: 'UPDATE',
          status: 'failed',
          error: error.message,
          userId
        });
      }
    }

    return { updatedTables, failedTables, errors, totalRecordsUpdated };
  }

  /**
   * Sort tables by dependency order
   */
  private sortTablesByDependencies(tableNames: string[]): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (tableName: string) => {
      if (visited.has(tableName)) return;
      if (visiting.has(tableName)) {
        throw new Error(`Circular dependency detected involving table: ${tableName}`);
      }

      visiting.add(tableName);

      const mapping = this.tableMappings.find(m => m.tableName === tableName);
      if (mapping?.dependencies) {
        for (const dep of mapping.dependencies) {
          if (tableNames.includes(dep)) {
            visit(dep);
          }
        }
      }

      visiting.delete(tableName);
      visited.add(tableName);
      sorted.push(tableName);
    };

    for (const tableName of tableNames) {
      visit(tableName);
    }

    return sorted;
  }

  /**
   * Validate table data against rules
   */
  private validateTableData(tableName: string, data: any): void {
    const mapping = this.tableMappings.find(m => m.tableName === tableName);
    if (!mapping?.validationRules) return;

    for (const rule of mapping.validationRules) {
      const value = data[rule.field];
      if (value === undefined) continue;

      switch (rule.rule) {
        case 'required':
          if (value === null || value === undefined) {
            throw new Error(rule.errorMessage);
          }
          break;
        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            throw new Error(rule.errorMessage);
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            throw new Error(rule.errorMessage);
          }
          break;
        case 'range':
          if (typeof value === 'number') {
            if (value < rule.value.min || value > rule.value.max) {
              throw new Error(rule.errorMessage);
            }
          }
          break;
        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            throw new Error(rule.errorMessage);
          }
          break;
      }
    }
  }

  /**
   * Update a specific table
   */
  private async updateTable(tableName: string, data: any): Promise<void> {
    console.log(`Updating table ${tableName} with data:`, data);

    try {
      // Call the appropriate API endpoint based on table name
      switch (tableName) {
        case 'school_stats':
          // For school stats, we might need to create a dedicated endpoint
          // For now, we'll update individual tables
          break;

        case 'students':
          // Update student count/stats - this might require a custom endpoint
          if (data.total_count !== undefined) {
            await this.updateStudentStats(data);
          }
          break;

        case 'classes':
          // Update class count/stats - this might require a custom endpoint
          if (data.total_count !== undefined) {
            await this.updateClassStats(data);
          }
          break;

        case 'fees':
          // Update fee statistics
          if (data.total_collected !== undefined || data.collection_rate !== undefined) {
            await this.updateFeeStats(data);
          }
          break;

        case 'teachers':
          // Update teacher statistics
          if (data.active_count !== undefined) {
            await this.updateTeacherStats(data);
          }
          break;

        case 'library':
          // Update library statistics
          if (data.total_books !== undefined) {
            await this.updateLibraryStats(data);
          }
          break;

        default:
          console.warn(`No update method defined for table: ${tableName}`);
      }
    } catch (error) {
      console.error(`Failed to update table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update student statistics
   */
  private async updateStudentStats(data: any): Promise<void> {
    // For student stats, we don't need to update the students table directly
    // The stats are calculated from the actual student data
    // This is just a placeholder for future statistics table updates
    console.log('Student stats update requested:', data);
    // In a real implementation, this might update a statistics cache or trigger recalculation
  }

  /**
   * Update class statistics
   */
  private async updateClassStats(data: any): Promise<void> {
    // Class statistics are calculated from actual class data
    // This method is a placeholder for future statistics caching
    console.log('Class stats update requested:', data);
  }

  /**
   * Update fee statistics
   */
  private async updateFeeStats(data: any): Promise<void> {
    // Fee statistics are calculated from actual fee data
    // This method is a placeholder for future statistics caching
    console.log('Fee stats update requested:', data);
  }

  /**
   * Update teacher statistics
   */
  private async updateTeacherStats(data: any): Promise<void> {
    // Teacher statistics are calculated from actual teacher data
    // This method is a placeholder for future statistics caching
    console.log('Teacher stats update requested:', data);
  }

  /**
   * Update library statistics
   */
  private async updateLibraryStats(data: any): Promise<void> {
    // Library statistics are calculated from actual library data
    // This method is a placeholder for future statistics caching
    console.log('Library stats update requested:', data);
  }

  /**
   * Log audit entry
   */
  private logAuditEntry(entry: AuditEntry): void {
    this.auditLog.push(entry);
    console.log('Audit Log:', entry);
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Export types and utilities
export { DataSyncService };