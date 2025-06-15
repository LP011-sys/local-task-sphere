
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useChatMessages, useSendMessage } from "@/hooks/useChatMessages";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Get auth user info (simplest way)
async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? "";
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get("task_id") || "";
  const [messageInput, setMessageInput] = useState("");
  const { data: messages, isLoading, isError } = useChatMessages(taskId);
  const sendMessage = useSendMessage();
  const [userId, setUserId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Determine other participant (show name as "You" for own messages)
  const getOtherParticipant = () => {
    if (!messages || messages.length === 0) return undefined;
    const msg = messages[0];
    return msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Get current user id
  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  // Submit a new message
  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!messageInput.trim() || !userId) return;
    // Figure out receiver (based on last message, or fallback)
    let receiver_id = "";
    if (messages && messages.length > 0) {
      const last = messages[messages.length - 1];
      receiver_id = last.sender_id === userId ? last.receiver_id : last.sender_id;
    } else {
      toast({
        title: "You cannot send a message.",
        description: "There are no participants on this task yet.",
      });
      return;
    }
    try {
      await sendMessage.mutateAsync({
        task_id: taskId,
        sender_id: userId,
        receiver_id,
        content: messageInput.trim(),
      });
      setMessageInput("");
    } catch (err: any) {
      toast({
        title: "Error sending message",
        description: err?.message || "Could not send your message.",
      });
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3 bg-white z-10">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back to Task
        </Button>
        <h2 className="font-bold text-lg">Task Chat</h2>
      </div>
      {/* Message area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-6 pb-24">
        {isLoading && <div className="text-center text-muted-foreground">Loading messages...</div>}
        {isError && <div className="text-center text-red-500">Failed to load messages.</div>}
        {(!messages || messages.length === 0) && !isLoading && (
          <div className="text-center text-muted-foreground">No messages yet.</div>
        )}
        {messages &&
          messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              content={msg.content}
              isOwn={msg.sender_id === userId}
              senderName={msg.sender_id === userId ? undefined : "Provider"}
              createdAt={msg.created_at}
            />
          ))}
      </div>
      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 bg-white border-t flex gap-2 px-2 py-2"
        style={{ zIndex: 20 }}
      >
        <Textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          rows={1}
          placeholder="Type your message…"
          className="flex-1 resize-none"
          autoFocus
        />
        <Button type="submit" disabled={sendMessage.isPending || !messageInput.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
