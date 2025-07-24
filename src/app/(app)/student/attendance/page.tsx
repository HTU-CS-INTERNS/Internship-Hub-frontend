'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRealtimeMetrics } from '@/hooks/use-realtime-metrics';
import { useAuth } from '@/contexts/auth-context';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { StudentApiService } from '@/lib/services/studentApi';
import EmptyState from '@/components/shared/empty-state';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent' | 'late' | 'partial';
  location?: string;
  workHours: number;
  notes?: string;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get realtime metrics for attendance data
  const { metrics: metricsData } = useRealtimeMetrics({
    userId: typeof user?.id === 'string' ? user.id : undefined,
    role: 'student',
    refreshInterval: 30000
  });

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        
        const data = await StudentApiService.getAttendanceRecords(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        );
        
        if (data && Array.isArray(data)) {
          setAttendanceRecords(data);
        } else {
          setAttendanceRecords([]);
        }
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        setError('Failed to load attendance data');
        setAttendanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedWeek, user]);

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: 'default',
      late: 'secondary',
      partial: 'outline',
      absent: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const weekStats = attendanceRecords.reduce((stats, record) => {
    if (record.status === 'present' || record.status === 'late') {
      stats.present++;
    } else if (record.status === 'partial') {
      stats.partial++;
    } else if (record.status === 'absent' && !record.notes?.includes('Weekend')) {
      stats.absent++;
    }
    stats.totalHours += record.workHours;
    return stats;
  }, { present: 0, partial: 0, absent: 0, totalHours: 0 });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading attendance data...</div>;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to Load Attendance Data"
        description={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!attendanceRecords.length) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
            <p className="text-muted-foreground">Monitor your internship attendance and work hours</p>
          </div>
        </div>
        
        <EmptyState
          icon={CalendarDays}
          title="No Attendance Records"
          description="No attendance data found for the selected week. Start by checking in to your internship location."
          actionLabel="Check In Now"
          onAction={() => window.location.href = '/student/check-in'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor your internship attendance and work hours</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigateWeek('prev')}>
            Previous Week
          </Button>
          <Button variant="outline" onClick={() => navigateWeek('next')}>
            Next Week
          </Button>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Present Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.present}</div>
            <p className="text-xs text-muted-foreground">Full attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Partial Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.partial}</div>
            <p className="text-xs text-muted-foreground">Early departure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Absent Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.absent}</div>
            <p className="text-xs text-muted-foreground">Missed days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Work hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Attendance Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
          </CardTitle>
          <CardDescription>
            Daily attendance records and work hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceRecords.map((record) => {
              const date = parseISO(record.date);
              const isToday = isSameDay(date, new Date());
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isToday ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  } ${isWeekend ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(date, 'dd')}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(record.status)}
                          {isToday && (
                            <Badge variant="outline" className="text-xs">
                              Today
                            </Badge>
                          )}
                        </div>
                        
                        {record.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {record.location}
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">Check In</div>
                        <div className="font-medium">
                          {record.checkInTime || '—'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-muted-foreground">Check Out</div>
                        <div className="font-medium">
                          {record.checkOutTime || '—'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-muted-foreground">Hours</div>
                        <div className="font-medium">
                          {record.workHours > 0 ? record.workHours.toFixed(1) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your attendance and location check-ins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Check In Now
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Request Time Off
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              View Full Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
