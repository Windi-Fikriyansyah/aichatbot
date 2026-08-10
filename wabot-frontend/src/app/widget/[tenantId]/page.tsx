"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { Send, Bot } from "lucide-react";

interface WidgetConfig {
  primaryColor: string;
  welcomeMessage: string;
  botName: string;
}

interface Message {
  id: string;
  role: 'CUSTOMER' | 'AI' | 'HUMAN_AGENT';
  content: string;
}

export default function WidgetApp() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/widget/config/${tenantId}`)
      .then(res => {
        if (res.data) setConfig(res.data);
      })
      .catch(err => console.error("Failed to load widget config"));

    // Ensure session ID exists
    let cId = localStorage.getItem(`wa_widget_session_${tenantId}`);
    if (!cId) {
      cId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(`wa_widget_session_${tenantId}`, cId);
    }

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinWebVisitor", { tenantId, channelSessionId: cId });
    });

    newSocket.on("new-message", (msg: Message) => {
      setMessages(prev => {
        // Prevent duplicate AI messages if they have the same ID
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on("ai-status", (data: { status: string }) => {
      if (data.status === 'AI is thinking...') {
        setAiStatus('Sedang mengetik...');
      } else {
        setAiStatus(null);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [tenantId]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiStatus]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !config) return;

    const cId = localStorage.getItem(`wa_widget_session_${tenantId}`);

    // Optimistic update
    const tempMsg: Message = {
      id: Date.now().toString(),
      role: 'CUSTOMER',
      content: inputText
    };
    setMessages(prev => [...prev, tempMsg]);

    // Emit to backend
    socket.emit('send-web-message', {
      tenantId,
      channelSessionId: cId,
      content: inputText
    });

    setInputText("");
  };

  if (!config) return <div className="p-4 text-center text-gray-500 text-sm">Memuat Chat...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-900 overflow-hidden font-sans">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between text-white shadow-md z-10"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">{config.botName}</h1>
            <p className="text-[10px] opacity-90 uppercase tracking-wider font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-start gap-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm text-gray-800 dark:text-gray-200 max-w-[85%]">
            {config.welcomeMessage}
          </div>
        </div>

        {messages.map((msg, idx) => {
          const isCustomer = msg.role === 'CUSTOMER';
          return (
            <div key={idx} className={`flex items-start gap-2 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                p-3 rounded-2xl text-sm shadow-sm max-w-[85%]
                ${isCustomer
                  ? 'rounded-tr-sm text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm text-gray-800 dark:text-gray-200'}
              `} style={isCustomer ? { backgroundColor: config.primaryColor } : {}}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {aiStatus && (
          <div className="flex items-start gap-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-full text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[9px] text-gray-400 dark:text-gray-600 font-medium tracking-wide">
            POWERED BY Balasin
          </span>
        </div>
      </div>
    </div>
  );
}
