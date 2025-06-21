
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, User } from "lucide-react";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";

type Conversation = {
  id: string;
  task_id: string;
  participants: string[];
  created_at: string;
  task: {
    title: string;
  };
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    name: string;
  };
};

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          task:tasks(title)
        `)
        .contains("participants", [user.id])
        .order("created_at", { ascending: false });

      if (error) throw error;

      setConversations(data || []);
      
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to load conversations", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:app_users!messages_sender_id_fkey(name)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      toast({ 
        title: "Failed to load messages", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert([{
          conversation_id: selectedConversation,
          sender_id: currentUserId,
          content: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedConversation);
    } catch (error: any) {
      toast({ 
        title: "Failed to send message", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary" size={20} />
              <h2 className="text-lg font-bold">Messages</h2>
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accept an offer to start chatting
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 transition ${
                    selectedConversation === conversation.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conversation.task?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-medium">
                  {conversations.find(c => c.id === selectedConversation)?.task?.title}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    content={message.content}
                    isOwn={message.sender_id === currentUserId}
                    senderName={message.sender?.name}
                    createdAt={message.created_at}
                  />
                ))}
              </div>
              
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="min-w-[80px] bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <Send size={16} />
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
