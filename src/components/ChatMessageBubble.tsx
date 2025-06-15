
import React from "react";
import { format } from "date-fns";

type Props = {
  content: string;
  isOwn: boolean;
  senderName?: string;
  createdAt: string;
};

export function ChatMessageBubble({ content, isOwn, senderName, createdAt }: Props) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow
        ${isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
        <div className="text-xs mb-1 opacity-70">
          {isOwn ? "You" : senderName || "Provider"}
        </div>
        <div className="whitespace-pre-wrap break-words">{content}</div>
        <div className="text-[10px] mt-1 text-right opacity-50">
          {format(new Date(createdAt), "dd MMM yyyy HH:mm")}
        </div>
      </div>
    </div>
  );
}
