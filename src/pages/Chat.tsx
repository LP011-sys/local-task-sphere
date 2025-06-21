import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, User } from "lucide-react";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TranslationToggle } from "@/components/TranslationToggle";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { useChatMessages, useSendMessage } from "@/hooks/useChatMessages";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";

type TaskWithMessages = {
  id: string;
  description: string;
  status: string;
  user_id: string;
  created_at: string;
};

export default function Chat() {
  const [tasks, setTasks] = useState<TaskWithMessages[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const { toast } = useToast();

  // Use the real-time chat messages hook
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(selectedTask);
  const sendMessageMutation = useSendMessage();
  
  // Get current user profile for language preferences
  const { data: currentUserProfile } = useCurrentUserProfile(currentUserId);

  useEffect(() => {
    loadTasksWithMessages();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadTasksWithMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get tasks where user is involved (as customer)
      const { data: tasksData, error: tasksError } = await supabase
        .from("Tasks")
        .select("id, description, status, user_id, created_at")
        .eq("user_id", user.id)
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTask || !currentUserId) return;

    // Find the task to get the other participant
    const task = tasks.find(t => t.id === selectedTask);
    if (!task) return;

    // Get receiver's profile for language preference
    const { data: receiverProfile } = await supabase
      .from("app_users")
      .select("preferred_language")
      .eq("id", task.user_id === currentUserId ? task.user_id : task.user_id)
      .single();

    const receiverId = task.user_id === currentUserId ? task.user_id : task.user_id;
    const senderLanguage = currentUserProfile?.preferred_language || 'en';
    const receiverLanguage = receiverProfile?.preferred_language || 'en';

    try {
      await sendMessageMutation.mutateAsync({
        task_id: selectedTask,
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: newMessage.trim(),
        senderLanguage: translationEnabled ? senderLanguage : undefined,
        receiverLanguage: translationEnabled ? receiverLanguage : undefined,
      });

      setNewMessage("");
    } catch (error: any) {
      toast({ 
        title: "Failed to send message", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  // Check if current user and receiver have different languages
  const selectedTaskData = tasks.find(t => t.id === selectedTask);
  const showTranslationOptions = selectedTaskData && currentUserProfile?.preferred_language !== 'en'; // Simplified check

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
                    <NotificationBadge show={unreadCounts[task.id] > 0} count={unreadCounts[task.id]}>
                      <User className="text-gray-400" size={16} />
                    </NotificationBadge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.description.substring(0, 50)}...</p>
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
                  {tasks.find(t => t.id === selectedTask)?.description.substring(0, 100)}...
                </h3>
                <TranslationToggle
                  enabled={translationEnabled}
                  onToggle={setTranslationEnabled}
                  showDifferentLanguages={showTranslationOptions}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : (
                  messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      content={message.content}
                      isOwn={message.sender_id === currentUserId}
                      senderName="User"
                      createdAt={message.created_at}
                      originalText={message.original_text}
                      translatedText={message.translated_text}
                      translatedTo={message.translated_to}
                      sourceLanguage={message.source_language}
                    />
                  ))
                )}
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
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
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
