
'use client';
import * as React from 'react';
import { MessageSquareText, Search, User, Briefcase, Users as UsersIconLucide } from 'lucide-react'; // Renamed Users to avoid conflict
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User as AppUser } from '@/types'; // Keep original User type
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import PageHeader from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface EnrichedAppUser extends Partial<AppUser> {
  lastMessage?: string;
  lastMessageTimestamp?: string;
  online?: boolean;
  unreadCount?: number;
}

// DUMMY_CONTACTS remains here for the list view
const DUMMY_CONTACTS: EnrichedAppUser[] = [
  { id: 'lecturer1', name: 'Dr. Emily Carter', role: 'LECTURER', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Hi Alex, sure, what is your question?', lastMessageTimestamp: '2024-07-29T10:05:00Z', online: true, unreadCount: 1 },
  { id: 'supervisor1', name: 'John Smith (Acme Corp)', role: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Good morning John, I completed the task.', lastMessageTimestamp: '2024-07-28T09:00:00Z', online: false },
  { id: 'hod1', name: 'Prof. Alan Turing', role: 'HOD', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'See you at the faculty meeting.', lastMessageTimestamp: '2024-07-27T14:30:00Z', online: true, unreadCount: 0 },
  { id: 'student_coord', name: 'Sarah Miller (Coordinator)', role: 'LECTURER', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Please submit your choices by Friday.', lastMessageTimestamp: '2024-07-29T15:00:00Z', online: false, unreadCount: 3 },
];

const getInitials = (name: string = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
};

const formatLastMessageTime = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  if (isToday(date)) return format(date, 'p');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
};

const getRoleIcon = (role?: AppUser['role']) => {
    switch (role) {
      case 'LECTURER': return User;
      case 'SUPERVISOR': return Briefcase;
      case 'HOD': return UsersIconLucide; // Using renamed import
      default: return User;
    }
};

export default function CommunicationListPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredContacts = DUMMY_CONTACTS.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Communication Hub"
        icon={MessageSquareText}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Chats" }]}
      />
      <Card className="flex-1 flex flex-col shadow-lg rounded-xl m-4 md:m-6 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10 rounded-lg bg-muted border-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredContacts.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredContacts.map(contact => {
                return (
                  <Link href={`/communication/${contact.id}`} key={contact.id} passHref>
                    <Button
                      variant={'ghost'}
                      className="w-full justify-start h-auto py-3 px-4 rounded-lg hover:bg-muted/50"
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={contact.avatarUrl} alt={contact.name || 'Contact'} data-ai-hint="person portrait"/>
                          <AvatarFallback className="bg-primary/20 text-primary text-lg">{getInitials(contact.name)}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-3 block h-3 w-3 rounded-full bg-green-500 border-2 border-card ring-1 ring-green-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm truncate text-card-foreground">{contact.name}</p>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {formatLastMessageTime(contact.lastMessageTimestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <p className="text-xs text-muted-foreground truncate pr-2">{contact.lastMessage || `Chat with ${contact.name}`}</p>
                          {contact.unreadCount && contact.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground shrink-0">{contact.unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground p-6">
                <Search className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-semibold">No contacts found.</p>
                <p>Try adjusting your search term.</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
