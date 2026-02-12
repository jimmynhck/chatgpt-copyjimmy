'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Plus, Trash2, Menu, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isLoading]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New chat',
      messages: [],
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    let activeChatId = currentChatId;
    let updatedChats = [...chats];

    if (!activeChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [userMessage],
      };
      updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      setCurrentChatId(newChat.id);
      activeChatId = newChat.id;
    } else {
      updatedChats = chats.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      );
      setChats(updatedChats);
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedChats.find(c => c.id === activeChatId)?.messages || [],
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Sorry, I encountered an error. Please try again.',
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#171717] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={createNewChat}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-[#424242] text-white hover:bg-[#262626] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setCurrentChatId(chat.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center gap-3 w-full px-3 py-3 rounded-lg cursor-pointer mb-1 ${
                  currentChatId === chat.id
                    ? 'bg-[#262626]'
                    : 'hover:bg-[#262626]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate flex-1 text-sm text-gray-300">
                  {chat.title}
                </span>
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3d3d3d] rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#424242]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">ChatGPT Clone</p>
                <p className="text-xs text-gray-400">Free tier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#424242]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-[#262626] rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {currentChat?.title || 'New chat'}
          </h1>
          <div className="w-10" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-gray-400 text-center max-w-md">
                I&apos;m a ChatGPT clone powered by a free AI API. Ask me anything!
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-6 ${
                    message.role === 'user' ? 'bg-[#0d0d0d]' : 'bg-[#171717]'
                  }`}
                >
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-gray-600'
                          : 'bg-gradient-to-br from-green-400 to-blue-500'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <span className="text-sm font-medium">You</span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="px-4 py-6 bg-[#171717]">
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#424242] px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#2d2d2d] rounded-xl border border-[#424242] focus-within:border-[#8e8ea0]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatGPT..."
                rows={1}
                className="w-full bg-transparent px-4 py-3 pr-12 resize-none outline-none text-white placeholder-gray-500 max-h-[200px]"
                style={{ minHeight: '52px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-white text-black disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              ChatGPT clone built by JIMMY • AI can make mistakes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}