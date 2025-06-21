
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, User } from "lucide-react";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";

type TaskWithMessages = {
  id: string;
  title: string;
  status: string;
  customer_id: string;
  created_at: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  task_id: string;
  created_at: string;
  sender: {
    name: string;
  };
};

export default function Chat() {
  const [tasks, setTasks] = useState<TaskWithMessages[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTasksWithMessages();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      loadMessages(selectedTask);
    }
  }, [selectedTask]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadTasksWithMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get tasks where user is involved (as customer or has sent/received messages)
      const { data: tasksData, error: tasksError } = await supabase
        .from("Tasks")
        .select("id, title, status, customer_id, created_at")
        .or(`customer_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
      
      if (tasksData && tasksData.length > 0 && !selectedTask) {
        setSelectedTask(tasksData[0].id);
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

  const loadMessages = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:app_users!messages_sender_id_fkey(name)
        `)
        .eq("task_id", taskId)
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
    
    if (!newMessage.trim() || !selectedTask || !currentUserId) return;

    // Find the task to get the other participant
    const task = tasks.find(t => t.id === selectedTask);
    if (!task) return;

    // For now, assume the receiver is the task customer if current user is not customer
    const receiverId = task.customer_id === currentUserId ? task.customer_id : task.customer_id;

    try {
      const { error } = await supabase
        .from("messages")
        .insert([{
          task_id: selectedTask,
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: newMessage.trim()
        }]);

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedTask);
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
        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary" size={20} />
              <h2 className="text-lg font-bold">Messages</h2>
            </div>
          </div>
          
          <div className="overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a task to start chatting
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 transition ${
                    selectedTask === task.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
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
          {selectedTask ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-medium">
                  {tasks.find(t => t.id === selectedTask)?.title}
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
