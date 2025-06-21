
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChatMessages, useSendMessage } from "@/hooks/useChatMessages";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TranslationToggle } from "@/components/TranslationToggle";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { taskId } = useParams<{ taskId: string }>();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState<string>("");
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [receiverLanguage, setReceiverLanguage] = useState<string>("en");
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const { data: messages, isLoading } = useChatMessages(taskId);
  const sendMessage = useSendMessage();

  // Get current user profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentUser } = useCurrentUserProfile(user?.id);

  // Get receiver info and language
  useEffect(() => {
    if (!taskId || !user?.id) return;

    const fetchReceiverInfo = async () => {
      // Get task info to determine who the receiver is
      const { data: task } = await supabase
        .from("Tasks")
        .select("user_id")
        .eq("id", taskId)
        .single();

      if (task) {
        const isTaskOwner = task.user_id === user.id;
        
        // If current user is task owner, receiver could be any provider who made an offer
        // If current user is provider, receiver is the task owner
        if (isTaskOwner) {
          // Get the latest offer to determine receiver
          const { data: offer } = await supabase
            .from("offers")
            .select("provider_id")
            .eq("task_id", taskId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (offer) {
            setReceiverId(offer.provider_id);
            // Get provider language
            const { data: provider } = await supabase
              .from("app_users")
              .select("preferred_language")
              .eq("id", offer.provider_id)
              .single();
            
            if (provider) {
              setReceiverLanguage(provider.preferred_language || "en");
            }
          }
        } else {
          setReceiverId(task.user_id);
          // Get task owner language
          const { data: customer } = await supabase
            .from("app_users")
            .select("preferred_language")
            .eq("id", task.user_id)
            .single();
          
          if (customer) {
            setReceiverLanguage(customer.preferred_language || "en");
          }
        }
      }
    };

    fetchReceiverInfo();
  }, [taskId, user?.id]);

  // Check for new messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== user?.id) {
        setHasNewMessages(true);
      }
    }
  }, [messages, user?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !taskId || !user?.id || !receiverId) return;

    try {
      await sendMessage.mutateAsync({
        task_id: taskId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: message,
        senderLanguage: currentUser?.preferred_language || "en",
        receiverLanguage: translationEnabled ? receiverLanguage : undefined,
      });
      setMessage("");
      setHasNewMessages(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const differentLanguages = currentUser?.preferred_language !== receiverLanguage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-primary" />
        <h1 className="text-2xl font-bold">Task Chat</h1>
        {hasNewMessages && <NotificationBadge />}
      </div>

      <TranslationToggle
        enabled={translationEnabled}
        onToggle={setTranslationEnabled}
        showDifferentLanguages={differentLanguages}
      />

      <Card className="p-4 mb-4 h-96 overflow-y-auto">
        {messages?.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {messages?.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                content={msg.content}
                isOwn={msg.sender_id === user?.id}
                senderName={msg.sender_id === user?.id ? "You" : "Provider"}
                createdAt={msg.created_at}
                originalText={msg.original_text}
                translatedText={msg.translated_text}
                translatedTo={msg.translated_to}
                sourceLanguage={msg.source_language}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
          rows={2}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || sendMessage.isPending}
          size="lg"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
