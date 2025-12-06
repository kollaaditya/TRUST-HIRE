import { useState, useEffect, useRef } from "react";
import { mongoAPI as supabase } from "@/lib/mongodb-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender_profile?: {
    full_name: string;
  };
}

interface ChatSystemProps {
  jobId?: string;
  receiverId: string;
  receiverName: string;
}

export const ChatSystem = ({ jobId, receiverId, receiverName }: ChatSystemProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const userId = data.user._id || data.user.id;
          setCurrentUserId(userId);
          fetchMessages(userId);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    getCurrentUser();
  }, [receiverId]);

  // Fetch messages when component mounts or receiverId changes
  useEffect(() => {
    if (currentUserId) {
      fetchMessages(currentUserId);
    }
  }, [currentUserId, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!currentUserId) return;
    
    const interval = setInterval(() => {
      fetchMessages(currentUserId);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentUserId, receiverId]);

  const fetchMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Fetching messages for user:', userId, 'with receiver:', receiverId);
      const response = await fetch(`http://localhost:3001/api/messages/${receiverId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received messages:', data);
        const formattedMessages = data.map((msg: any) => ({
          id: msg._id,
          content: msg.content,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          created_at: msg.created_at
        }));
        setMessages(formattedMessages);
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error: any) {
      console.error('Message fetch error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          content: newMessage.trim(),
          jobId
        })
      });

      if (response.ok) {
        setNewMessage("");
        // Immediately fetch messages to show the sent message
        fetchMessages(currentUserId);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat with {receiverName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_id !== currentUserId && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {receiverName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
