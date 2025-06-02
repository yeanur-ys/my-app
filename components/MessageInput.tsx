import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Send, Loader2 } from "lucide-react";

export function MessageInput({
  onSendMessage,
  disabled,
  loading,
}: {
  onSendMessage: (content: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="pr-10 resize-none"
            disabled={disabled || loading}
          />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleSend} size="icon" disabled={!message.trim() || disabled || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
