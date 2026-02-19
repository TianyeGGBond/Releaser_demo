import { trpc } from "@/lib/trpc";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useState } from "react";
import { Bot, Plus, MessageSquare, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are an AI DevOps assistant for an Internal Developer Platform.",
    },
  ]);
  const [sessionId, setSessionId] = useState<number | undefined>();

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Please try again.`,
        },
      ]);
    },
  });

  const handleSend = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    chatMutation.mutate({
      messages: newMessages.filter((m) => m.role !== "system"),
      sessionId,
    });
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "system",
        content: "You are an AI DevOps assistant for an Internal Developer Platform.",
      },
    ]);
    setSessionId(undefined);
  };

  const suggestedPrompts = [
    "Analyze this failed deployment log and suggest a fix",
    "Why is my Kubernetes pod in CrashLoopBackOff?",
    "How do I set up a canary deployment?",
    "Explain DORA metrics and how to improve them",
    "Help me debug a Docker build failure",
    "What are best practices for CI/CD pipelines?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered troubleshooting for deployments, logs, and infrastructure
          </p>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-card border rounded-md hover:bg-accent transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>

      <AIChatBox
        messages={messages}
        onSendMessage={handleSend}
        isLoading={chatMutation.isPending}
        placeholder="Paste deployment logs or describe your issue..."
        height="calc(100vh - 200px)"
        emptyStateMessage="Ask me about deployment issues, build errors, or infrastructure problems"
        suggestedPrompts={suggestedPrompts}
      />
    </div>
  );
}
