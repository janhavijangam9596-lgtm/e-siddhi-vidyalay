// Hook for data synchronization between dashboard and database

import { useState, useCallback } from 'react';
import { dataSyncService, DashboardData, SyncResult } from '../utils/data-sync';
import { toast } from 'sonner';

interface UseDataSyncReturn {
  syncData: (dashboardData: DashboardData, userId?: string) => Promise<SyncResult>;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  clearLastResult: () => void;
}

export function useDataSync(): UseDataSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncData = useCallback(async (dashboardData: DashboardData, userId?: string): Promise<SyncResult> => {
    setIsSyncing(true);
    setLastSyncResult(null);

    try {
      toast.loading('Synchronizing data with database...', { id: 'data-sync' });

      const result = await dataSyncService.synchronizeDashboardData(dashboardData, userId);

      setLastSyncResult(result);

      if (result.success) {
        toast.success(
          `Data synchronized successfully! Updated ${result.totalRecordsUpdated} records across ${result.updatedTables.length} tables.`,
          { id: 'data-sync' }
        );
      } else {
        toast.error(
          `Synchronization failed for ${result.failedTables.length} tables. Check the audit log for details.`,
          { id: 'data-sync' }
        );
      }

      return result;

    } catch (error: any) {
      const errorResult: SyncResult = {
        success: false,
        updatedTables: [],
        failedTables: [],
        errors: [error.message],
        auditLog: [],
        totalRecordsUpdated: 0,
        executionTime: 0
      };

      setLastSyncResult(errorResult);
      toast.error(`Synchronization failed: ${error.message}`, { id: 'data-sync' });

      return errorResult;

    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearLastResult = useCallback(() => {
    setLastSyncResult(null);
  }, []);

  return {
    syncData,
    isSyncing,
    lastSyncResult,
    clearLastResult
  };
}