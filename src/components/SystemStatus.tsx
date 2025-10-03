import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Memory, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memoryUsage: string;
  diskSpace: string;
  databaseConnections: number;
  lastMaintenanceDate: string;
  systemLoad: 'low' | 'normal' | 'high' | 'critical';
}

interface SystemMetrics {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  activeUsers: number;
  pendingAdmissions: number;
  feeCollection: number;
  attendanceRate: number;
  examResults: number;
  systemHealth: string;
  lastBackup: string;
  serverStatus: string;
}

export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [healthData, metricsData] = await Promise.all([
        api.getSystemHealth(),
        api.getSystemMetrics()
      ]);
      
      setHealth(healthData);
      setMetrics(metricsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'low':
        return 'text-green-600';
      case 'normal':
        return 'text-blue-600';
      case 'high':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const parsePercentage = (value: string): number => {
    return parseInt(value.replace('%', ''));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Status</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={loadSystemData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall System Health Alert */}
      {health && health.status === 'critical' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System is experiencing critical issues. Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health?.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <Badge className={getStatusColor(health?.status || 'unknown')}>
                {health?.status || 'Unknown'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: {health?.uptime || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Memory className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{health?.memoryUsage || '0%'}</span>
              </div>
              <Progress 
                value={parsePercentage(health?.memoryUsage || '0%')} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disk Space
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{health?.diskSpace || '0%'}</span>
              </div>
              <Progress 
                value={parsePercentage(health?.diskSpace || '0%')} 
                className="h-2" 
              />
              {parsePercentage(health?.diskSpace || '0%') > 80 && (
                <p className="text-xs text-orange-600">
                  Disk space running low
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">Connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {health?.databaseConnections || 0} active connections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.totalStudents || 0}</div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.totalStaff || 0}</div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.totalClasses || 0}</div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Attendance Rate</span>
                <span>{metrics?.attendanceRate || 0}%</span>
              </div>
              <Progress value={metrics?.attendanceRate || 0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Exam Results Average</span>
                <span>{metrics?.examResults || 0}%</span>
              </div>
              <Progress value={metrics?.examResults || 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>System Load</span>
                <span className={getLoadColor(health?.systemLoad || 'normal')}>
                  {health?.systemLoad || 'Normal'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Server Status</span>
              <Badge className={getStatusColor(metrics?.serverStatus || 'unknown')}>
                {metrics?.serverStatus || 'Unknown'}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm">{metrics?.lastBackup || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Maintenance</span>
              <span className="text-sm">{health?.lastMaintenanceDate || 'N/A'}</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Auto-refresh every 30 seconds
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}