
'use client';
import * as React from 'react';
import { ArrowLeft, Send, User, Briefcase, Search, Phone, Video, MoreVertical, Paperclip, Smile, Users as UsersIconLucide } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CommunicationMessage, User as AppUser } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // For accessing chatId and navigation

interface EnrichedAppUser extends Partial<AppUser> {
  lastMessage?: string;
  lastMessageTimestamp?: string;
  online?: boolean;
  unreadCount?: number;
}

// DUMMY DATA (Should be fetched or from a shared store in a real app)
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

// Helper functions
const getInitials = (name: string = '') => name.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
const formatLastMessageTime = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = parseISO(timestamp);
  if (isToday(date)) return format(date, 'p');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
};
const formatMessageTimestamp = (timestamp: string) => format(parseISO(timestamp), 'p');


export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;

  const [selectedContact, setSelectedContact] = React.useState<EnrichedAppUser | null>(null);
  const [messages, setMessages] = React.useState<CommunicationMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const contact = DUMMY_CONTACTS.find(c => c.id === chatId);
    if (contact) {
      setSelectedContact(contact);
      setMessages(DUMMY_MESSAGES[chatId] || []);
    } else {
      // Handle contact not found, maybe redirect or show error
      router.push('/communication');
    }
  }, [chatId, router]);

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

    // Update dummy messages (in a real app, this would be an API call)
    if (!DUMMY_MESSAGES[selectedContact.id!]) DUMMY_MESSAGES[selectedContact.id!] = [];
    DUMMY_MESSAGES[selectedContact.id!].push(message);
    
    // Update contact's last message (simulated)
    const contactIndex = DUMMY_CONTACTS.findIndex(c => c.id === selectedContact.id);
    if (contactIndex !== -1) {
      DUMMY_CONTACTS[contactIndex].lastMessage = newMessage;
      DUMMY_CONTACTS[contactIndex].lastMessageTimestamp = message.timestamp;
    }
    setNewMessage('');
  };
  
  if (!selectedContact) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquareText className="h-24 w-24 text-muted-foreground/30 mb-6" />
        <p className="text-xl font-semibold text-foreground">Loading chat...</p>
         <Link href="/communication" passHref>
            <Button variant="outline" className="mt-4">Back to Chats</Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Custom Chat Header */}
      <div className="flex items-center p-3 border-b border-border bg-card shadow-sm h-[65px] sticky top-0 z-10 md:top-[var(--app-header-height)]">
        <Link href="/communication" passHref>
          <Button variant="ghost" size="icon" className="mr-2 rounded-full text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
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

      {/* Message Area */}
      <ScrollArea className="flex-1 p-4 space-y-4 bg-muted/20">
        {messages.map((msg, index) => {
          const isSender = msg.senderId === CURRENT_USER_ID;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                isSender ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn("max-w-[70%] sm:max-w-[60%] p-0", isSender ? "pl-6" : "pr-6")}>
                <div className={cn(
                    "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-md",
                    isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none",
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
          )
        })}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Footer */}
      <div className="p-3 border-t border-border bg-card h-[70px] sticky bottom-0 z-10 md:bottom-[var(--mobile-bottom-nav-height)]">
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
    </div>
  );
}
