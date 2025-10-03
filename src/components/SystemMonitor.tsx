import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { api } from '../utils/api';
import { 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  Clock, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity
} from 'lucide-react';

interface SystemStatus {
  status: 'operational' | 'maintenance' | 'error';
  uptime: string;
  lastMaintenance: string;
  version: string;
  environment: string;
  database: 'connected' | 'disconnected' | 'maintenance';
  apiHealth: 'healthy' | 'degraded' | 'down';
}

export function SystemMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to get system status:', error);
      // Set error status if API call fails
      setSystemStatus({
        status: 'error',
        uptime: '0%',
        lastMaintenance: 'Unknown',
        version: 'Unknown',
        environment: 'Unknown',
        database: 'disconnected',
        apiHealth: 'down'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'down':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
      case 'down':
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUptimePercentage = (uptime: string) => {
    const percentage = parseFloat(uptime.replace('%', ''));
    return isNaN(percentage) ? 0 : percentage;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={checkSystemStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall System Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(systemStatus?.status || 'error')}
            <div>
              <h3 className="font-semibold">Overall System Status</h3>
              <p className="text-sm text-muted-foreground">
                {systemStatus?.environment} environment
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(systemStatus?.status || 'error')}>
            {systemStatus?.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Uptime */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">System Uptime</span>
              </div>
              <span className="text-sm">{systemStatus?.uptime || '0%'}</span>
            </div>
            <Progress 
              value={getUptimePercentage(systemStatus?.uptime || '0%')} 
              className="h-2"
            />
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus?.database || 'disconnected')}
              <Badge 
                variant="outline" 
                className={getStatusColor(systemStatus?.database || 'disconnected')}
              >
                {systemStatus?.database?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
          </div>

          {/* API Health */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">API Health</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus?.apiHealth || 'down')}
              <Badge 
                variant="outline" 
                className={getStatusColor(systemStatus?.apiHealth || 'down')}
              >
                {systemStatus?.apiHealth?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
          </div>

          {/* Security Status */}
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge className="bg-green-100 text-green-800 border-green-200">
                SECURE
              </Badge>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h4 className="font-medium mb-2">System Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span>{systemStatus?.version || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span className="capitalize">{systemStatus?.environment || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Maintenance</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Maintenance:</span>
                <span>
                  {systemStatus?.lastMaintenance ? 
                    new Date(systemStatus.lastMaintenance).toLocaleDateString() : 
                    'Unknown'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Scheduled:</span>
                <span>TBD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            View Detailed Logs
          </Button>
          <Button variant="outline" size="sm">
            Performance Metrics
          </Button>
          <Button variant="outline" size="sm">
            System Health Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}