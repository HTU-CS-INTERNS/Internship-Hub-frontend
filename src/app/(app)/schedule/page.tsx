
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { CalendarDays, Clock, PlusCircle, Users, UserCircle as UserCircleIcon, Bell as BellIcon } from 'lucide-react'; // Renamed icons to avoid conflict
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, addHours, setHours, setMinutes, startOfDay } from 'date-fns';

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'deadline' | 'personal' | 'reminder';
  description?: string;
  attendees?: string[]; // For meetings
}

const DUMMY_EVENTS: ScheduleEvent[] = [
  { id: 'evt1', title: 'Team Standup Meeting', startTime: setMinutes(setHours(new Date(), 9), 0), endTime: setMinutes(setHours(new Date(), 9), 30), type: 'meeting', attendees: ['John S.', 'Alice W.'] },
  { id: 'evt2', title: 'Project Proposal Deadline', startTime: setHours(new Date(), 17), endTime: setHours(new Date(), 17), type: 'deadline', description: 'Submit final proposal document.' },
  { id: 'evt3', title: 'Focus Work: Module X', startTime: setHours(new Date(), 14), endTime: setHours(new Date(), 16), type: 'personal', description: 'Dedicated time for coding Module X features.' },
  { id: 'evt4', title: 'Client Demo Prep', startTime: addHours(new Date(), 24 * 2 + 10), endTime: addHours(new Date(), 24 * 2 + 11), type: 'meeting', attendees: ['Supervisor', 'Project Lead'] },
  { id: 'evt5', title: 'Submit Weekly Report', startTime: addHours(new Date(), 24 * 3 + 16), endTime: addHours(new Date(), 24 * 3 + 16), type: 'reminder' },
];

const eventTypeColors: Record<ScheduleEvent['type'], { bg: string, text: string, border: string, icon: React.ElementType }> = {
  meeting: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500', icon: Users },
  deadline: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', border: 'border-red-500', icon: Clock },
  personal: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500', icon: UserCircleIcon },
  reminder: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-500', icon: BellIcon },
};


export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [events, setEvents] = React.useState<ScheduleEvent[]>(DUMMY_EVENTS);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [newEventTitle, setNewEventTitle] = React.useState('');
  const [newEventTime, setNewEventTime] = React.useState('12:00');
  const [newEventType, setNewEventType] = React.useState<ScheduleEvent['type']>('meeting');
  const [newEventDescription, setNewEventDescription] = React.useState('');

  const isMobile = useIsMobile();
  const { toast } = useToast();

  const filteredEvents = React.useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter(event => format(event.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [selectedDate, events]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedDate) {
      toast({ title: "Error", description: "Event title and selected date are required.", variant: "destructive"});
      return;
    }
    
    const [hours, minutes] = newEventTime.split(':').map(Number);
    const startTime = setMinutes(setHours(startOfDay(selectedDate), hours), minutes);
    const endTime = addHours(startTime, 1); // Default 1 hour duration

    const newEvent: ScheduleEvent = {
      id: `evt${Date.now()}`,
      title: newEventTitle,
      startTime,
      endTime,
      type: newEventType,
      description: newEventDescription,
    };
    setEvents(prev => [...prev, newEvent]);
    toast({ title: "Event Added", description: `"${newEventTitle}" has been added to your schedule.`});
    setNewEventTitle('');
    setNewEventTime('12:00');
    setNewEventType('meeting');
    setNewEventDescription('');
    setIsSheetOpen(false);
  };
  
  const EventItemCard: React.FC<{event: ScheduleEvent}> = ({event}) => {
    const EventIcon = eventTypeColors[event.type].icon;
    return (
        <Card className={`shadow-lg rounded-xl border-l-4 ${eventTypeColors[event.type].border} ${eventTypeColors[event.type].bg}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className={`text-base font-semibold ${eventTypeColors[event.type].text}`}>{event.title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            {format(event.startTime, 'p')} - {format(event.endTime, 'p')}
                        </CardDescription>
                    </div>
                    <EventIcon className={`h-5 w-5 ${eventTypeColors[event.type].text}`} />
                </div>
                {event.description && <p className="text-xs text-muted-foreground mt-2">{event.description}</p>}
                {event.attendees && event.attendees.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Attendees: {event.attendees.join(', ')}</p>
                    </div>
                )}
                 <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary" onClick={() => toast({title: "Coming Soon", description:"Editing events will be available soon."})}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive/80" onClick={() => {
                        setEvents(prev => prev.filter(e => e.id !== event.id));
                        toast({title: "Event Removed", description: `"${event.title}" removed from schedule.`})
                    }}>Delete</Button>
                 </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="My Internship Schedule"
        description="View your upcoming meetings, deadlines, and personal events."
        icon={CalendarDays}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "My Schedule" }]}
        actions={
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-card text-card-foreground border-border">
                <SheetHeader>
                    <SheetTitle className="font-headline text-xl">Add New Event</SheetTitle>
                    <SheetDescription>
                        Plan your day by adding a new event to your schedule for {selectedDate ? format(selectedDate, 'PPP') : 'the selected date'}.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleAddEvent} className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="event-title" className="text-foreground">Event Title</Label>
                        <Input id="event-title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="e.g., Project Meeting" className="mt-1 rounded-lg border-input" required/>
                    </div>
                     <div>
                        <Label htmlFor="event-time" className="text-foreground">Start Time</Label>
                        <Input id="event-time" type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="mt-1 rounded-lg border-input" required/>
                    </div>
                     <div>
                        <Label htmlFor="event-type" className="text-foreground">Event Type</Label>
                         <select id="event-type" value={newEventType} onChange={e => setNewEventType(e.target.value as ScheduleEvent['type'])} className="mt-1 w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            {Object.keys(eventTypeColors).map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="event-description" className="text-foreground">Description (Optional)</Label>
                        <Textarea id="event-description" value={newEventDescription} onChange={e => setNewEventDescription(e.target.value)} placeholder="Add any relevant details..." className="mt-1 rounded-lg border-input" rows={3}/>
                    </div>
                    <SheetFooter className="mt-6">
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="rounded-lg border-input">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">Add Event</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
           </Sheet>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-xl rounded-xl bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow-inner bg-muted/20"
                disabled={(date) => date < new Date("2000-01-01")} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-xl rounded-xl bg-card text-card-foreground min-h-[300px]">
            <CardHeader>
              <CardTitle className="font-headline text-lg">
                Events for: <span className="text-primary">{selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}</span>
              </CardTitle>
              <CardDescription>
                {filteredEvents.length > 0 
                    ? `You have ${filteredEvents.length} event(s) scheduled.`
                    : "No events scheduled for this day."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => <EventItemCard key={event.id} event={event} />)
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <CalendarDays className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No events for {selectedDate ? format(selectedDate, 'PPP') : 'this day'}.</p>
                  <p className="text-xs mt-1">Select another date or add a new event.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
// Using different names for inline SVGs to prevent conflict if lucide-react names are used directly
const UserCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
);

const Bell = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

    
