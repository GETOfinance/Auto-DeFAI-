import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { useAutoScroll } from "@/components/ui/chat/hooks/useAutoScroll";
import { moment } from "@/lib/utils";
import "./App.css";
import CopyButton from "@/components/copy-button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Send } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatFileInput } from "@/components/ui/chat/chat-file-input";
import { messageStorage, StoredMessage } from "@/lib/storage";

type TextResponse = {
    text: string;
    user: string;
    isLoading?: boolean;
    attachments?: Array<{
        url: string;
        contentType: string;
        title: string;
    }>;
};

export default function Chat() {
    const agentId = "default"; // Hard-coded default agent
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { scrollRef, scrollToBottom, isAtBottom, disableAutoScroll } = useAutoScroll();

    // Add queryClient to get messages
    const queryClient = useQueryClient();
    
    // Load initial messages from storage when component mounts
    useEffect(() => {
        const storedMessages = messageStorage.getMessages(agentId);
        queryClient.setQueryData(["messages", agentId], storedMessages);
        setMessageCount(storedMessages.length);
    }, [queryClient]);

    // Query for messages
    const { data: messages = [] } = useQuery<TextResponse[]>({
        queryKey: ["messages", agentId],
        queryFn: () => {
            return queryClient.getQueryData(["messages", agentId]) || [];
        },
    });

    // Update message count whenever messages change
    useEffect(() => {
        const nonLoadingMessages = messages.filter(msg => !msg.isLoading);
        setMessageCount(nonLoadingMessages.length);
    }, [messages]);

    // Function to clear chat history
    const clearChatHistory = useCallback(() => {
        messageStorage.clearHistory(agentId);
        setMessageCount(0);
        queryClient.setQueryData(["messages", agentId], []);
        // Force immediate re-render
        queryClient.invalidateQueries({
            queryKey: ["messages", agentId],
            exact: true,
            refetchType: "all"
        });
    }, [queryClient]);

    // Save messages to storage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            const messagesToStore = messages
                .filter(msg => !msg.isLoading)
                .map(msg => ({
                    text: msg.text,
                    user: msg.user,
                    timestamp: Date.now(),
                    attachments: msg.attachments
                }));
            messageStorage.saveMessages(agentId, messagesToStore);
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const attachments = selectedFile ? [{
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
        }] : undefined;

        const userMessage: TextResponse = {
            text: input.trim(),
            user: "user",
            attachments,
        };

        const botMessage: TextResponse = {
            text: "I am a chat assistant. I can help you with various tasks. How can I assist you today?",
            user: "assistant",
            timestamp: Date.now(),
        };

        // Update messages immediately with user message and bot message
        const currentMessages = queryClient.getQueryData<TextResponse[]>(["messages", agentId]) || [];
        const updatedMessages = [...currentMessages, userMessage, botMessage];
        queryClient.setQueryData(["messages", agentId], updatedMessages);

        setInput("");
        setSelectedFile(null);
        
        // Save to storage
        const storedMessages: StoredMessage[] = updatedMessages.map(msg => ({
            text: msg.text,
            user: msg.user,
            timestamp: Date.now(),
            attachments: msg.attachments
        }));
        messageStorage.saveMessages(agentId, storedMessages);

        // Force a re-render
        queryClient.invalidateQueries({
            queryKey: ["messages", agentId],
            exact: true
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (e.nativeEvent.isComposing) return;
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col w-full h-screen">
                <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
                    <h1 className="font-medium text-lg">Chat</h1>
                    {messageCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={clearChatHistory}
                            title="Clear chat history"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            Clear History
                        </Button>
                    )}
                </div>
                {/* Messages container */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto pb-[100px] w-full"
                    onWheel={disableAutoScroll}
                    onTouchMove={disableAutoScroll}
                >
                    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col space-y-6 w-full">
                            {messages.length > 0 ? (
                                messages.map((message, idx) => (
                                    <ChatBubble
                                        key={`${message.user}-${idx}-${message.text}`}
                                        variant={message.user === "user" ? "sent" : "received"}
                                    >
                                        <ChatBubbleMessage isLoading={message.isLoading}>
                                            {message.user === "user" ? (
                                                <div>
                                                    <div className="whitespace-pre-wrap">{message.text}</div>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : message.isLoading ? null : (
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-line" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-[#7f00ff] hover:underline cursor-pointer" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                            code: ({inline, ...props}: {inline?: boolean} & React.HTMLProps<HTMLElement>) =>
                                                                inline ? (
                                                                    <code className="bg-black/30 rounded px-1 py-0.5" {...props} />
                                                                ) : (
                                                                    <code className="block bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />
                                                                ),
                                                            pre: ({node, ...props}) => <pre className="bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />,
                                                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                                            h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                                                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#7f00ff] pl-4 my-2 italic" {...props} />,
                                                            table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-[#27272A]" {...props} /></div>,
                                                            th: ({node, ...props}) => <th className="px-3 py-2 text-left text-sm font-semibold" {...props} />,
                                                            td: ({node, ...props}) => <td className="px-3 py-2 text-sm" {...props} />,
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ChatBubbleMessage>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                {!message.isLoading && (
                                                    <CopyButton text={message.text} />
                                                )}
                                            </div>
                                            <ChatBubbleTimestamp variant={message.user === "user" ? "sent" : "received"}>
                                                {moment().format("LT")}
                                            </ChatBubbleTimestamp>
                                        </div>
                                    </ChatBubble>
                                ))
                            ) : (
                                <div className="h-[calc(100vh-200px)] flex items-center justify-center">
                                    <div className="text-muted-foreground text-center">
                                        No messages yet. Start a conversation!
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scroll to bottom button */}
                {!isAtBottom && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-28 right-4 h-8 w-8 rounded-full bg-background shadow-md z-10"
                        onClick={scrollToBottom}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </Button>
                )}

                {/* Input form */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-[#27272A] bg-[#121212]/80 backdrop-blur-sm z-10">
                    <div className="max-w-3xl mx-auto p-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <div className="flex-1 relative rounded-md border bg-card">
                                    {selectedFile && (
                                        <div className="absolute bottom-full mb-2">
                                            <ChatFileInput
                                                selectedFile={selectedFile}
                                                onFileSelect={setSelectedFile}
                                            />
                                        </div>
                                    )}
                                    <ChatInput
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        className="min-h-12 resize-none rounded-md bg-[#1a1a1a] border-[#27272A] focus:border-[#7f00ff] focus:ring-[#7f00ff] p-3 shadow-none focus-visible:ring-0"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {!selectedFile && (
                                        <ChatFileInput
                                            selectedFile={selectedFile}
                                            onFileSelect={setSelectedFile}
                                        />
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={!input.trim() && !selectedFile}
                                        className="h-12 gap-1.5 bg-[#7f00ff] text-white hover:bg-[#7f00ff]/90"
                                    >
                                        Send
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}