
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Languages, Eye, EyeOff } from "lucide-react";

type Props = {
  content: string;
  isOwn: boolean;
  senderName?: string;
  createdAt: string;
  originalText?: string;
  translatedText?: string;
  translatedTo?: string;
  sourceLanguage?: string;
};

export function ChatMessageBubble({ 
  content, 
  isOwn, 
  senderName, 
  createdAt,
  originalText,
  translatedText,
  translatedTo,
  sourceLanguage
}: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  const hasTranslation = translatedText && originalText && translatedText !== originalText;
  const displayText = showOriginal ? originalText : content;
  
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow
        ${isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
        <div className="text-xs mb-1 opacity-70">
          {isOwn ? "You" : senderName || "Provider"}
        </div>
        <div className="whitespace-pre-wrap break-words">{displayText}</div>
        
        {hasTranslation && (
          <div className="mt-2 pt-2 border-t border-opacity-20 border-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="h-6 p-1 text-xs opacity-70 hover:opacity-100"
            >
              {showOriginal ? (
                <>
                  <EyeOff size={12} className="mr-1" />
                  Show translation
                </>
              ) : (
                <>
                  <Eye size={12} className="mr-1" />
                  Show original ({sourceLanguage?.toUpperCase()})
                </>
              )}
            </Button>
            {translatedTo && !showOriginal && (
              <div className="flex items-center text-xs opacity-50 mt-1">
                <Languages size={10} className="mr-1" />
                Translated to {translatedTo.toUpperCase()}
              </div>
            )}
          </div>
        )}
        
        <div className="text-[10px] mt-1 text-right opacity-50">
          {format(new Date(createdAt), "dd MMM yyyy HH:mm")}
        </div>
      </div>
    </div>
  );
}
