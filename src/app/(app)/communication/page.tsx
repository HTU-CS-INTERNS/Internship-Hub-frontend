
'use client';
import * as React from 'react';
import { MessageSquareText, Send, User, Users, Briefcase, Search, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CommunicationMessage, User as AppUser } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import PageHeader from '@/components/shared/page-header'; 
import { Badge } from '@/components/ui/badge'; // Added missing import

interface EnrichedAppUser extends Partial<AppUser> {
  lastMessage?: string;
  lastMessageTimestamp?: string;
  online?: boolean;
  unreadCount?: number;
}

const DUMMY_CONTACTS: EnrichedAppUser[] = [
  { id: 'lecturer1', name: 'Dr. Emily Carter', role: 'LECTURER', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Hi Alex, sure, what is your question?', lastMessageTimestamp: '2024-07-29T10:05:00Z', online: true, unreadCount: 1 },
  { id: 'supervisor1', name: 'John Smith (Acme Corp)', role: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Good morning John, I completed the task.', lastMessageTimestamp: '2024-07-28T09:00:00Z', online: false },
  { id: 'hod1', name: 'Prof. Alan Turing', role: 'HOD', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'See you at the faculty meeting.', lastMessageTimestamp: '2024-07-27T14:30:00Z', online: true, unreadCount: 0 },
  { id: 'student_coord', name: 'Sarah Miller (Coordinator)', role: 'LECTURER', avatarUrl: 'https://placehold.co/100x100.png', lastMessage: 'Please submit your choices by Friday.', lastMessageTimestamp: '2024-07-29T15:00:00Z', online: false, unreadCount: 3 },
];

const DUMMY_MESSAGES: Record<string, CommunicationMessage[]> = {
  'lecturer1': [
    { id: 'msg1', senderId: 'currentUser', receiverId: 'lecturer1', content: 'Hello Dr. Carter, I have a question about my weekly report. Specifically, the section regarding project scope - should I also include potential future work or stick strictly to what has been accomplished during the reporting period?', timestamp: '2024-07-29T10:00:00Z', read: true },
    { id: 'msg2', senderId: 'lecturer1', receiverId: 'currentUser', content: 'Hi Alex, sure, what is your question? For the weekly report, please focus on accomplished work. Future scope can be briefly mentioned in the conclusion if it directly stems from current findings.', timestamp: '2024-07-29T10:05:00Z', read: true },
  ],
  'supervisor1': [
    { id: 'msg4', senderId: 'currentUser', receiverId: 'supervisor1', content: 'Good morning John, I completed the assigned task for today regarding the API integration.', timestamp: '2024-07-28T09:00:00Z', read: true },
    { id: 'msg5', senderId: 'supervisor1', receiverId: 'currentUser', content: 'Great, thanks for the update Alex! Could you push the code to the dev branch?', timestamp: '2024-07-28T09:15:00Z', read: false },
  ],
   'hod1': [
    { id: 'msg6', senderId: 'hod1', receiverId: 'currentUser', content: 'See you at the faculty meeting tomorrow at 2 PM in Room 301.', timestamp: '2024-07-27T14:30:00Z', read: true },
   ],
   'student_coord': [
     { id: 'msg7', senderId: 'student_coord', receiverId: 'currentUser', content: 'Reminder: Please submit your elective choices for next semester by Friday.', timestamp: '2024-07-29T15:00:00Z', read: false},
     { id: 'msg8', senderId: 'currentUser', receiverId: 'student_coord', content: 'Thanks for the reminder, Sarah! I just submitted them.', timestamp: '2024-07-29T15:05:00Z', read: false}
   ]
};

const CURRENT_USER_ID = 'currentUser'; 

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

const formatMessageTimestamp = (timestamp: string) => {
  return format(parseISO(timestamp), 'p'); // e.g., 10:05 AM
};

export default function CommunicationPage() {
  const [selectedContact, setSelectedContact] = React.useState<EnrichedAppUser | null>(DUMMY_CONTACTS[0]);
  const [messages, setMessages] = React.useState<CommunicationMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
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
    
    if (!DUMMY_MESSAGES[selectedContact.id!]) DUMMY_MESSAGES[selectedContact.id!] = [];
    DUMMY_MESSAGES[selectedContact.id!].push(message);
    
    const contactIndex = DUMMY_CONTACTS.findIndex(c => c.id === selectedContact.id);
    if (contactIndex !== -1) {
      DUMMY_CONTACTS[contactIndex].lastMessage = newMessage;
      DUMMY_CONTACTS[contactIndex].lastMessageTimestamp = message.timestamp;
    }
    setNewMessage('');
  };
  
  const getRoleIcon = (role?: AppUser['role']) => {
    switch (role) {
      case 'LECTURER': return User;
      case 'SUPERVISOR': return Briefcase;
      case 'HOD': return Users;
      default: return User;
    }
  };

  const filteredContacts = DUMMY_CONTACTS.filter(contact => 
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-var(--app-header-height,theme(spacing.16)))]"> 
      <PageHeader
          title="Communication Hub"
          icon={MessageSquareText}
          breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Communication" }]}
        />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-border overflow-hidden">
        <div className="md:col-span-1 lg:col-span-1 bg-card border-r border-border flex flex-col h-full">
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
            <div className="p-2 space-y-1">
            {filteredContacts.map(contact => {
              const RoleIcon = getRoleIcon(contact.role);
              return (
              <Button
                key={contact.id}
                variant={selectedContact?.id === contact.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto py-3 px-4 rounded-lg"
                onClick={() => setSelectedContact(contact)}
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
            )})}
            </div>
          </ScrollArea>
        </div>

        <div className="md:col-span-2 lg:col-span-3 bg-background flex flex-col h-full">
          {selectedContact ? (
            <>
              <div className="flex items-center p-3 border-b border-border bg-card shadow-sm h-[65px]">
                 <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} data-ai-hint="person portrait"/>
                  <AvatarFallback className="bg-primary/20 text-primary">{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-card-foreground">{selectedContact.name}</p>
                  <p className="text-xs text-green-500">{selectedContact.online ? 'Online' : `Last seen ${formatLastMessageTime(selectedContact.lastMessageTimestamp)}`}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Phone className="h-5 w-5"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Video className="h-5 w-5"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><MoreVertical className="h-5 w-5"/></Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 space-y-4 bg-muted/20">
                {messages.map((msg, index) => {
                  const isSender = msg.senderId === CURRENT_USER_ID;
                  const prevMessage = messages[index-1];
                  const nextMessage = messages[index+1];
                  const isFirstInGroup = !prevMessage || prevMessage.senderId !== msg.senderId;
                  const isLastInGroup = !nextMessage || nextMessage.senderId !== msg.senderId;

                  return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      isSender ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                        "max-w-[70%] sm:max-w-[60%] p-0",
                        isSender ? "pl-6" : "pr-6" 
                    )}>
                        <div className={cn(
                            "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-md",
                            isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none",
                            isFirstInGroup && isSender && "rounded-tr-lg",
                            isFirstInGroup && !isSender && "rounded-tl-lg",
                            isLastInGroup && isSender && "rounded-br-lg",
                            isLastInGroup && !isSender && "rounded-bl-lg"
                        )}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <span className={cn(
                                "text-xs self-end opacity-80 mt-1",
                                isSender ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                                {formatMessageTimestamp(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                  </div>
                )})}
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-3 border-t border-border bg-card h-[70px]">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Smile className="h-5 w-5"/></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Paperclip className="h-5 w-5"/></Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1 rounded-full h-10 px-4 bg-muted border-input focus:bg-background"
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquareText className="h-24 w-24 text-muted-foreground/30 mb-6" />
              <p className="text-xl font-semibold text-foreground">Welcome to the Communication Hub</p>
              <p className="text-muted-foreground mt-1">Select a contact from the list to start messaging.</p>
              <p className="text-xs text-muted-foreground mt-4">Your conversations are end-to-end encrypted (simulated).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

    