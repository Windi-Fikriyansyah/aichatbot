'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { User, Bot, Loader2, Send, Image as ImageIcon, CheckCircle2, AlertCircle, Smartphone, Globe } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function ChatViewer() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [aiTyping, setAiTyping] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenantId') : '';

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    if (!tenantId) return;

    // Fetch initial list
    fetchConversations();

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`);
    
    // Bergabung ke room tenant
    socket.emit('joinTenant', tenantId);

    // Mendengarkan status AI
    socket.on('ai-status', (data) => {
      if (data.status === 'AI is thinking...' && data.senderPhone) {
        setAiTyping(data.senderPhone);
      } else {
        setAiTyping(null);
      }
    });

    // Mendengarkan pesan baru
    socket.on('new-message', (newMessage) => {
      setMessages(prev => {
        // Cek apakah pesan untuk obrolan yang sedang aktif
        if (newMessage.conversationId === activeConvIdRef.current) {
          // Cegah duplikasi
          if (!prev.find(m => m.id === newMessage.id)) {
            return [...prev, newMessage];
          }
        }
        return prev;
      });
      // Update last message di sidebar
      setConversations(prev => {
        let found = false;
        const updated = prev.map(c => {
          if (c.id === newMessage.conversationId) {
            found = true;
            return { 
              ...c, 
              lastMessageAt: newMessage.createdAt,
              messages: [{ content: newMessage.content }] // Update text snippet
            };
          }
          return c;
        });
        
        if (!found) {
          // Refresh list if it's a completely new conversation
          fetchConversations();
        }
        
        // Sort conversations by lastMessageAt descending
        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    });

    // Mendengarkan perubahan status
    socket.on('status-update', (data) => {
      setConversations(prev => prev.map(c => {
        if (c.id === data.conversationId) {
          return { ...c, status: data.status };
        }
        return c;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [tenantId]);

  useEffect(() => {
    // Auto scroll ke bawah saat pesan baru masuk
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations`, { headers: { 'x-tenant-id': tenantId } });
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (id: string) => {
    setLoadingMsg(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations/${id}/messages`, { headers: { 'x-tenant-id': tenantId } });
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    fetchMessages(id);
  };

  const handleStatusChange = async (status: string) => {
    if (!activeConvId) return;
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations/${activeConvId}/status`, { status }, { headers: { 'x-tenant-id': tenantId } });
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, status } : c));
    } catch (e) {
      console.error('Gagal mengubah status', e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !mediaUrl.trim()) || !activeConvId) return;

    setIsReplying(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/chat/conversations/${activeConvId}/reply`, {
        content: replyText,
        mediaUrl: mediaUrl || undefined
      }, { headers: { 'x-tenant-id': tenantId } });
      
      // Update local UI immediately
      setMessages(prev => {
        if (!prev.find(m => m.id === response.data.id)) {
          return [...prev, response.data];
        }
        return prev;
      });
      
      setReplyText('');
      setMediaUrl('');
      setShowMediaInput(false);
      
      // Jika statusnya AI_HANDLING, otomatis ubah jadi HUMAN_HANDLING karena manusia ikut campur
      const activeConv = conversations.find(c => c.id === activeConvId);
      if (activeConv && activeConv.status === 'AI_HANDLING') {
        handleStatusChange('HUMAN_HANDLING');
      }

    } catch (e) {
      console.error('Gagal membalas pesan', e);
      alert('Gagal mengirim pesan.');
    } finally {
      setIsReplying(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageBreadcrumb pageTitle="Live Chat" />
      
      <div className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl flex overflow-hidden">
        {/* Sidebar Conversation List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-black/20">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-lg flex justify-between items-center text-gray-800 dark:text-white/90">
            <span>Percakapan</span>
            <span className="text-xs bg-brand-500 text-white px-2 py-1 rounded-full">{conversations.length}</span>
          </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(c => {
            const isActive = activeConvId === c.id;
            const lastMsg = c.messages?.[0]?.content || 'Mulai percakapan';
            return (
              <div 
                key={c.id} 
                onClick={() => handleSelectConv(c.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-800/50 cursor-pointer transition-colors ${isActive ? 'bg-brand-50 dark:bg-brand-500/10 border-l-4 border-l-brand-500' : 'hover:bg-gray-100 dark:hover:bg-white/5 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white/90 truncate max-w-[120px]">
                      {c.customerName || c.customerPhone || 'Pengunjung Web'}
                    </h4>
                    {c.channel === 'WEB' ? (
                      <span className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        <Globe className="w-2.5 h-2.5 mr-0.5" /> WEB
                      </span>
                    ) : (
                      <span className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        <Smartphone className="w-2.5 h-2.5 mr-0.5" /> WA
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    {c.lastMessageAt ? format(new Date(c.lastMessageAt), 'HH:mm') : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {c.status === 'HUMAN_HANDLING' && <User className="w-3 h-3 text-warning-500" />}
                  {c.status === 'AI_HANDLING' && <Bot className="w-3 h-3 text-success-500" />}
                  {c.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 text-gray-400" />}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{lastMsg}</p>
                </div>
                {aiTyping === c.customerPhone && (
                  <p className="text-xs text-success-500 mt-1 animate-pulse">AI is typing...</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-bold text-lg">
                  {(activeConv.customerName || activeConv.customerPhone || 'W').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800 dark:text-white/90">
                      {activeConv.customerName || (activeConv.channel === 'WEB' ? 'Pengunjung Web' : 'Pelanggan')}
                    </h3>
                    {activeConv.channel === 'WEB' ? (
                      <span className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border border-blue-200 dark:border-blue-800/50">
                        <Globe className="w-3 h-3 mr-1" /> WEB
                      </span>
                    ) : (
                      <span className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border border-green-200 dark:border-green-800/50">
                        <Smartphone className="w-3 h-3 mr-1" /> WHATSAPP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activeConv.customerPhone || 'Sesi ID: ' + activeConv.channelSessionId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Status:</span>
                <select 
                  className={`text-sm rounded-lg px-3 py-1.5 outline-none border border-gray-200 dark:border-gray-700 ${
                    activeConv.status === 'HUMAN_HANDLING' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400' : 
                    activeConv.status === 'RESOLVED' ? 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' : 
                    'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                  }`}
                  value={activeConv.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="AI_HANDLING" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">🟢 AI Handling</option>
                  <option value="HUMAN_HANDLING" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">⚠️ Human Takeover</option>
                  <option value="RESOLVED" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">✅ Resolved</option>
                </select>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConv.status === 'HUMAN_HANDLING' && (
                <div className="flex justify-center mb-4">
                  <span className="bg-warning-50 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400 text-xs px-3 py-1 rounded-full flex items-center border border-warning-200 dark:border-warning-500/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    AI dijeda. Anda sedang mengambil alih percakapan ini.
                  </span>
                </div>
              )}
              {loadingMsg ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
              ) : (
                messages.map(m => {
                  const isAgentOrAi = m.role === 'AI' || m.role === 'HUMAN_AGENT';
                  const isAgent = m.role === 'HUMAN_AGENT';
                  return (
                    <div key={m.id} className={`flex ${isAgentOrAi ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                        isAgent ? 'bg-warning-500 rounded-tr-sm text-white' : 
                        isAgentOrAi ? 'bg-brand-500 rounded-tr-sm text-white' : 
                        'bg-gray-100 dark:bg-gray-800 rounded-tl-sm text-gray-800 dark:text-gray-200'
                      }`}>
                        <div className={`flex items-center space-x-2 mb-1 opacity-80 text-xs ${isAgentOrAi ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isAgent ? <User className="w-3 h-3" /> : isAgentOrAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span>{isAgent ? 'Agen (Anda)' : isAgentOrAi ? 'WaBot AI' : 'Pelanggan'}</span>
                        </div>
                        {m.mediaUrl && (
                          <div className="mb-2">
                            <img src={m.mediaUrl} alt="Media" className="rounded-lg max-h-60 object-cover" />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                        <p className={`text-[10px] mt-1 text-right opacity-60 ${isAgentOrAi ? 'text-white/60' : 'text-slate-500 dark:text-slate-400'}`}>
                          {format(new Date(m.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              {aiTyping && aiTyping === activeConv.customerPhone && (
                <div className="flex justify-end">
                  <div className="bg-indigo-600/50 text-white p-3 rounded-2xl rounded-tr-sm text-sm italic animate-pulse">
                    AI sedang merangkai balasan...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
              <form onSubmit={handleSendReply} className="flex flex-col space-y-3">
                {showMediaInput && (
                  <Input
                    placeholder="URL Gambar (Opsional)"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    className="bg-black/40 border-white/10 h-10 text-sm"
                  />
                )}
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className={`hover:bg-white/10 ${showMediaInput ? 'text-indigo-400' : 'text-slate-400'}`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Input
                    placeholder="Ketik balasan Anda di sini..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 h-12"
                  />
                  <Button 
                    type="submit" 
                    disabled={isReplying || (!replyText.trim() && !mediaUrl.trim())}
                    className="bg-brand-500 hover:bg-brand-600 text-white h-12 w-12 rounded-xl"
                  >
                    {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Bot className="w-16 h-16 mb-4 opacity-20" />
            <p>Pilih percakapan di bilah kiri untuk memantau chat.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
