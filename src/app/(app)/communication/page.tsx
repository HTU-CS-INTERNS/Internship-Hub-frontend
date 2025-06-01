'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { MessageSquare, Send, User, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CommunicationMessage, User as AppUser } from '@/types'; // Assuming User type from types/index.ts
import { cn } from '@/lib/utils';

const DUMMY_CONTACTS: Array<Partial<AppUser>> = [
  { id: 'lecturer1', name: 'Dr. Emily Carter', role: 'LECTURER', avatarUrl: 'https://placehold.co/100x100.png?text=EC' },
  { id: 'supervisor1', name: 'John Smith (Company)', role: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100.png?text=JS' },
  { id: 'hod1', name: 'Prof. Alan Turing', role: 'HOD', avatarUrl: 'https://placehold.co/100x100.png?text=AT' },
];

const DUMMY_MESSAGES: Record<string, CommunicationMessage[]> = {
  'lecturer1': [
    { id: 'msg1', senderId: 'currentUser', receiverId: 'lecturer1', content: 'Hello Dr. Carter, I have a question about my weekly report.', timestamp: '2024-07-29T10:00:00Z', read: true },
    { id: 'msg2', senderId: 'lecturer1', receiverId: 'currentUser', content: 'Hi Alex, sure, what is your question?', timestamp: '2024-07-29T10:05:00Z', read: true },
    { id: 'msg3', senderId: 'currentUser', receiverId: 'lecturer1', content: 'Regarding the project scope section, should I include future work?', timestamp: '2024-07-29T10:07:00Z', read: false },
  ],
  'supervisor1': [
    { id: 'msg4', senderId: 'currentUser', receiverId: 'supervisor1', content: 'Good morning John, I completed the assigned task for today.', timestamp: '2024-07-28T09:00:00Z', read: true },
  ],
   'hod1': [],
};

const CURRENT_USER_ID = 'currentUser'; // Placeholder for current user's ID

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function CommunicationPage() {
  const [selectedContact, setSelectedContact] = React.useState<Partial<AppUser> | null>(DUMMY_CONTACTS[0]);
  const [messages, setMessages] = React.useState<CommunicationMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedContact) {
      setMessages(DUMMY_MESSAGES[selectedContact.id!] || []);
    }
  }, [selectedContact]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const message: CommunicationMessage = {
      id: `msg${Date.now()}`,
      senderId: CURRENT_USER_ID,
      receiverId: selectedContact.id!,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, message]);
    // Also update DUMMY_MESSAGES for persistence in this demo
    if (!DUMMY_MESSAGES[selectedContact.id!]) DUMMY_MESSAGES[selectedContact.id!] = [];
    DUMMY_MESSAGES[selectedContact.id!].push(message);
    setNewMessage('');
  };
  
  const getRoleIcon = (role?: AppUser['role']) => {
    switch (role) {
      case 'LECTURER': return User;
      case 'SUPERVISOR': return Briefcase;
      case 'HOD': return Users;
      default: return User;
    }
  }

  return (
    <div className="space-y-8 h-[calc(100vh-theme(spacing.32))] flex flex-col"> {/* Adjusted height */}
      <PageHeader
        title="Communication Hub"
        description="Connect with your lecturers, supervisors, and HOD."
        icon={MessageSquare}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Communication" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0"> {/* Ensure flex-1 and min-h-0 for layout */}
        <Card className="md:col-span-1 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Contacts</CardTitle>
            <CardDescription>Select a contact to view messages.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0"> {/* Make content scrollable */}
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
              {DUMMY_CONTACTS.map(contact => (
                <Button
                  key={contact.id}
                  variant={selectedContact?.id === contact.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={contact.avatarUrl} alt={contact.name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{getInitials(contact.name || 'N A')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-left">{contact.name}</p>
                    <p className="text-xs text-muted-foreground text-left flex items-center">
                      {React.createElement(getRoleIcon(contact.role), { className: "h-3 w-3 mr-1"})}
                      {contact.role}
                    </p>
                  </div>
                </Button>
              ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                   <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{getInitials(selectedContact.name || 'N A')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-headline">{selectedContact.name}</CardTitle>
                    <CardDescription className="flex items-center">
                       {React.createElement(getRoleIcon(selectedContact.role), { className: "h-3 w-3 mr-1"})}
                       {selectedContact.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100%-4rem)] p-4 space-y-4"> {/* Adjusted height */}
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        msg.senderId === CURRENT_USER_ID
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.content}
                      <span className={cn("text-xs self-end", msg.senderId === CURRENT_USER_ID ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-24 w-24 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Select a contact to start messaging.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
