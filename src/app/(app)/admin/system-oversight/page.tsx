'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Shield, Activity, Database, Server, AlertTriangle, CheckCircle, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AdminApiService } from '@/lib/services/adminApi';
import EmptyState from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import type { CheckIn } from '@/types';
import { format, parseISO } from 'date-fns';

interface SystemHealth {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  databaseConnections: number;
  apiResponseTime: number;
  errorRate: number;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export default function SystemOversightPage() {
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = React.useState<SystemHealth | null>(null);
  const [systemLogs, setSystemLogs] = React.useState<SystemLog[]>([]);
  const [checkInLogs, setCheckInLogs] = React.useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [healthData, logsData, checkinsData] = await Promise.all([
          AdminApiService.getSystemHealth(),
          AdminApiService.getSystemLogs(),
          AdminApiService.getCheckInLogs()
        ]);
        
        if (healthData && typeof healthData === 'object') {
          setSystemHealth(healthData as SystemHealth);
        }
        
        const logsArray = Array.isArray(logsData) ? logsData : [];
        setSystemLogs(logsArray);

        const checkinsArray = Array.isArray(checkinsData) ? checkinsData : [];
        setCheckInLogs(checkinsArray);
        
      } catch (err) {
        console.error('Failed to fetch system data:', err);
        setError('Failed to load system data');
        // Set mock data as fallback
        setSystemHealth({
          uptime: '7 days, 14 hours',
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 23,
          activeUsers: 156,
          databaseConnections: 12,
          apiResponseTime: 245,
          errorRate: 0.1
        });
        setSystemLogs([
          { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'System startup completed', source: 'System' },
          { id: '2', timestamp: new Date().toISOString(), level: 'warning', message: 'High memory usage detected', source: 'Monitor' },
          { id: '3', timestamp: new Date().toISOString(), level: 'error', message: 'Database connection timeout', source: 'Database' }
        ]);
        setCheckInLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="System Oversight"
          description="Monitor system health, performance metrics, and application logs."
          icon={Shield}
          breadcrumbs={[
            { href: "/admin/dashboard", label: "Admin Dashboard" },
            { label: "System Oversight" }
          ]}
        />
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading system data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="System Oversight"
        description="Monitor system health, performance metrics, and application logs."
        icon={Shield}
        breadcrumbs={[
          { href: "/admin/dashboard", label: "Admin Dashboard" },
          { label: "System Oversight" }
        ]}
        actions={
          <Button onClick={() => window.location.reload()} className="rounded-lg">
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        }
      />
      
      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{systemHealth?.uptime || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
        {/* Other health cards... */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Logs */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Recent Check-in Logs</CardTitle>
            <CardDescription>Latest student check-in activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {checkInLogs.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No Check-in Logs"
                description="No recent student check-ins available."
              />
            ) : (
              <div className="space-y-3">
                {checkInLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-4 w-4 text-primary mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{log.student_id}</span>
                        <Badge variant={log.is_gps_verified ? 'default' : 'secondary'} className="text-xs">
                          {log.is_gps_verified ? 'GPS' : 'Manual'}
                        </Badge>
                        {log.is_outside_geofence && (
                          <Badge variant="destructive" className="text-xs">Outside Geofence</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {log.address_resolved || log.manual_reason || 'No location details'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                          {format(parseISO(log.check_in_timestamp), "MMMM d, yyyy 'at' p")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Recent System Logs</CardTitle>
            <CardDescription>Latest system events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {systemLogs.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No System Logs"
                description="No recent system logs available."
              />
            ) : (
              <div className="space-y-3">
                {systemLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge className={getLogBadgeColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          [{log.source}]
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
