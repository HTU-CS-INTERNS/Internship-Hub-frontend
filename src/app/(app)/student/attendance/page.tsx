
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isWeekend as isWeekendUtil } from 'date-fns';
import { getCheckInsByStudentId } from '@/lib/services/checkInService';
import EmptyState from '@/components/shared/empty-state';
import PageHeader from '@/components/shared/page-header';
import Link from 'next/link';

interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkInTime: string | null;
  checkOutTime: string | null; // Placeholder for now
  status: 'present' | 'absent' | 'late' | 'partial' | 'weekend';
  location?: string;
  workHours: number;
  isGpsVerified?: boolean;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateWeekRecords = useCallback((weekStart: Date, checkIns: any[]) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

      return weekDays.map(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          const checkInForDay = checkIns.find(ci => format(parseISO(ci.check_in_timestamp), 'yyyy-MM-dd') === dateString);
          const isWeekend = isWeekendUtil(day);
          
          if (isWeekend) {
            return {
              id: dateString,
              date: dateString,
              checkInTime: null,
              checkOutTime: null,
              status: 'weekend',
              location: 'Weekend',
              workHours: 0,
            };
          }
          
          if (checkInForDay) {
              return {
                  id: checkInForDay.id,
                  date: dateString,
                  checkInTime: format(parseISO(checkInForDay.check_in_timestamp), 'p'),
                  checkOutTime: null, // Not implemented
                  status: 'present', // Add logic for 'late' if needed
                  location: checkInForDay.address_resolved || 'Checked In',
                  workHours: 8.0, // Mock value
                  isGpsVerified: checkInForDay.is_gps_verified,
              };
          }

          return {
              id: dateString,
              date: dateString,
              checkInTime: null,
              checkOutTime: null,
              status: 'absent',
              workHours: 0,
          };
      });
  }, []);
  
  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user?.email) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
        const checkIns = await getCheckInsByStudentId(user.email);
        const records = generateWeekRecords(weekStart, checkIns);
        setAttendanceRecords(records);
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        setError('Failed to load attendance data');
        setAttendanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedWeek, user, generateWeekRecords]);

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'partial': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'weekend': return <CalendarDays className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: 'default',
      late: 'secondary',
      partial: 'outline',
      absent: 'destructive',
      weekend: 'outline'
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
    } else if (record.status === 'absent') {
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
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Attendance Tracking"
        description="Monitor your internship attendance and work hours"
        icon={CalendarDays}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Attendance" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-semibold">
              Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
            </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigateWeek('prev')}><ChevronLeft className="h-4 w-4 mr-1"/> Prev</Button>
          <Button variant="outline" onClick={() => navigateWeek('next')}>Next <ChevronRight className="h-4 w-4 ml-1"/></Button>
        </div>
      </div>
      
      {error && (
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Attendance Data"
          description={error}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      )}

      {!error && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Present</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{weekStats.present}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" />Partial</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{weekStats.partial}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" />Absent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{weekStats.absent}</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-500" />Total Hours</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{weekStats.totalHours.toFixed(1)}</div></CardContent></Card>
        </div>

        <Card>
            <CardHeader><CardTitle>Weekly Log</CardTitle><CardDescription>Daily attendance records and work hours.</CardDescription></CardHeader>
            <CardContent>
            {attendanceRecords.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No Records" description="No attendance records for this week." />
            ) : (
                <div className="space-y-4">
                {attendanceRecords.map((record) => {
                    const date = parseISO(record.date);
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                    <div key={record.id} className={`p-4 rounded-lg border transition-colors ${ isToday ? 'bg-primary/5 border-primary/20' : 'bg-card' } ${ record.status === 'weekend' ? 'opacity-60 bg-muted/50' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-center w-12 shrink-0"><div className="text-sm font-medium text-muted-foreground">{format(date, 'EEE')}</div><div className="text-lg font-bold">{format(date, 'dd')}</div></div>
                            <div className="flex-1"><div className="flex items-center gap-2 mb-1">{getStatusBadge(record.status)}{isToday && (<Badge variant="outline" className="text-xs">Today</Badge>)}</div>{record.location && (<div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{record.location}</div>)}</div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="text-center"><div className="text-muted-foreground">Check In</div><div className="font-medium">{record.checkInTime || '—'}</div></div>
                            <div className="text-center"><div className="text-muted-foreground">Check Out</div><div className="font-medium">{record.checkOutTime || '—'}</div></div>
                            <div className="text-center"><div className="text-muted-foreground">Hours</div><div className="font-medium">{record.workHours > 0 ? record.workHours.toFixed(1) : '—'}</div></div>
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
            <div className="flex flex-wrap gap-3">
                <Button asChild className="flex items-center gap-2"><Link href="/student/check-in"><MapPin className="h-4 w-4" />Check In Now</Link></Button>
            </div>
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
