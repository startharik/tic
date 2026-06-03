import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Paperclip, Send, Phone, Video, Info, Loader2 } from 'lucide-react';
import { 
  getJobs, 
  createChatMessage, 
  createMedia,
  getChatMessagesByJobIds,
  getChatMessageById,
  markChatThreadRead,
  type ChatMessage, 
  type Job
} from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const ChatPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);

  // Process messages into threads (group by job_id)
  const threads = useMemo(() => {
    const threadMap: Record<string, { id: string; job: Job; lastMessage?: ChatMessage; unread: number }> = {};
    jobs.forEach(job => {
      threadMap[job.id] = { id: job.id, job, unread: 0 };
    });
    messages.forEach(msg => {
      const thread = threadMap[msg.job_id];
      if (thread) {
        if (!thread.lastMessage || new Date(msg.created_at) > new Date(thread.lastMessage.created_at)) {
          thread.lastMessage = msg;
        }
        if (!msg.is_read && user?.id !== msg.sender_id) {
          thread.unread += 1;
        }
      }
    });
    const norm = threadSearch.trim().toLowerCase();
    const items = Object.values(threadMap).filter(t => t.job);
    if (!norm) return items;
    return items.filter((t) => {
      const jobTitle = (t.job.title || '').toLowerCase();
      const clientName = (t.job.clients?.name || '').toLowerCase();
      const branchName = (t.job.branches?.name || '').toLowerCase();
      const id = (t.job.id || '').toLowerCase();
      const lastSender = t.lastMessage?.sender
        ? `${t.lastMessage.sender.first_name || ''} ${t.lastMessage.sender.last_name || ''}`.trim().toLowerCase()
        : '';
      return (
        jobTitle.includes(norm) ||
        clientName.includes(norm) ||
        branchName.includes(norm) ||
        id.includes(norm) ||
        lastSender.includes(norm)
      );
    });
  }, [messages, jobs, threadSearch, user?.id]);

  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? threads[0], [activeThreadId, threads]);

  const activeMessages = useMemo(() => {
    return messages.filter(m => m.job_id === activeThread?.id).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages, activeThread]);

  useEffect(() => {
    if (!attachment) {
      if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
      setAttachmentPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(attachment);
    setAttachmentPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [attachment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobList = await getJobs();
        const role = userProfile?.role;
        const filteredJobs =
          role === 'engineer'
            ? jobList.filter((j) => j.assigned_to === user?.id)
            : jobList;

        setJobs(filteredJobs);

        const jobIds = filteredJobs.map((j) => j.id);
        const chatMessages = await getChatMessagesByJobIds(jobIds);
        setMessages(chatMessages);

        const params = new URLSearchParams(location.search);
        const initialJobId = params.get('jobId');
        const exists = initialJobId ? jobIds.includes(initialJobId) : false;
        if (exists) {
          setActiveThreadId(initialJobId as string);
        } else if (jobIds.length > 0) {
          setActiveThreadId(jobIds[0]);
        } else {
          setActiveThreadId('');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search, user?.id, userProfile?.role]);

  useEffect(() => {
    if (!user) return;
    const jobIds = jobs.map((j) => j.id);
    if (jobIds.length === 0) return;

    const channel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const inserted = payload.new as { id: string; job_id: string; sender_id: string } | null;
          if (!inserted || !jobIds.includes(inserted.job_id)) return;
          try {
            const msg = await getChatMessageById(inserted.id);
            setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            if (activeThreadId === inserted.job_id && inserted.sender_id !== user.id) {
              await markChatThreadRead(inserted.job_id, user.id);
              setMessages((prev) =>
                prev.map((m) => (m.job_id === inserted.job_id && m.sender_id !== user.id ? { ...m, is_read: true } : m))
              );
            }
          } catch {
            setMessages((prev) =>
              prev.some((m) => m.id === inserted.id)
                ? prev
                : [
                    ...prev,
                    {
                      id: inserted.id,
                      job_id: inserted.job_id,
                      sender_id: inserted.sender_id,
                      message: (payload.new as any)?.message ?? '',
                      media_id: (payload.new as any)?.media_id ?? null,
                      is_read: (payload.new as any)?.is_read ?? false,
                      created_at: (payload.new as any)?.created_at ?? new Date().toISOString(),
                    } as ChatMessage,
                  ]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThreadId, jobs, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, activeMessages.length]);

  useEffect(() => {
    const markRead = async () => {
      if (!user || !activeThreadId) return;
      const hasUnread = messages.some((m) => m.job_id === activeThreadId && !m.is_read && m.sender_id !== user.id);
      if (!hasUnread) return;
      try {
        await markChatThreadRead(activeThreadId, user.id);
        setMessages((prev) =>
          prev.map((m) => (m.job_id === activeThreadId && m.sender_id !== user.id ? { ...m, is_read: true } : m))
        );
      } catch {}
    };
    markRead();
  }, [activeThreadId, messages, user]);

  useEffect(() => {
    setAttachment(null);
    setMessageText('');
  }, [activeThreadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !user) return;
    const text = messageText.trim();
    if (!text && !attachment) return;
    try {
      setIsSending(true);
      let mediaId: string | null = null;
      let finalMessage = text;

      if (attachment) {
        const isImage = attachment.type.startsWith('image/');
        const isVideo = attachment.type.startsWith('video/');
        if (!isImage && !isVideo) {
          throw new Error('Only photo and video attachments are supported.');
        }

        const safeName = sanitizeFileName(attachment.name);
        const path = `chat/${activeThread.id}/${user.id}/${Date.now()}_${safeName}`;

        const upload = await supabase.storage.from('media').upload(path, attachment, {
          cacheControl: '3600',
          upsert: false,
          contentType: attachment.type || undefined,
        });
        if (upload.error) throw upload.error;

        const publicUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
        if (!publicUrl) throw new Error('Failed to generate attachment URL.');

        const mediaType = isImage ? 'image' : 'video';
        const created = await createMedia({
          job_id: activeThread.id,
          uploaded_by: user.id,
          file_name: attachment.name,
          file_type: mediaType,
          file_url: publicUrl,
        });
        mediaId = created.id;
        if (!finalMessage) finalMessage = mediaType === 'image' ? 'Photo' : 'Video';
      }

      const newMessage = await createChatMessage({
        job_id: activeThread.id,
        sender_id: user.id,
        message: finalMessage,
        media_id: mediaId,
      });
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
        <p className="text-slate-500 text-sm">Admin ↔ Engineer and job-based communication.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-96 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search job, client, branch, or id..."
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((thread) => {
              const job = thread.job;
              const lastMsg = thread.lastMessage;
              const lastUser = lastMsg?.sender;
              const lastPreview =
                lastMsg?.media
                  ? lastMsg.message || (lastMsg.media.file_type === 'image' ? 'Photo' : 'Video')
                  : lastMsg?.message || 'No messages yet';
              const title = lastUser 
                ? `${lastUser.first_name || ''} ${lastUser.last_name || ''}`.trim() || 'Unknown' 
                : job.assigned_users
                  ? `${job.assigned_users.first_name} ${job.assigned_users.last_name}`.trim() || job.title || 'Job Chat'
                  : job.title || 'Job Chat';
              const subtitle = `${job.title || 'Job'}${job.clients?.name ? ` • ${job.clients.name}` : ''}`;
              
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    activeThreadId === thread.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700">
                        {title
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{title}</div>
                        <div className="text-xs text-slate-500 truncate">{subtitle}</div>
                        <div className="text-xs text-slate-600 truncate mt-1">{lastPreview}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString() : ''}
                      </div>
                      {thread.unread > 0 && (
                        <div className="mt-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-600 text-white text-[11px] font-bold">
                          {thread.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {activeThread && (
            <>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center font-extrabold text-primary-700 text-xs">
                    {activeThread.job.title?.split(' ').slice(0,2).map(n => n[0]).join('') || 'JC'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{activeThread.job.title}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {activeThread.job.clients?.name ? activeThread.job.clients.name : 'Job Chat'}
                      {activeThread.job.branches?.name ? ` • ${activeThread.job.branches.name}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
                <div className="space-y-3">
                  {activeMessages.map((m) => {
                    const isCurrentUser = user?.id === m.sender_id;
                    const hasMedia = !!m.media;
                    return (
                      <div key={m.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                          isCurrentUser
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-slate-900 border-slate-100'
                        }`}>
                          {hasMedia && m.media && (
                            <div className="mb-2">
                              {m.media.file_type === 'image' ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(m.media!.file_url, '_blank', 'noopener,noreferrer')}
                                  className="block"
                                >
                                  <img
                                    src={m.media.file_url}
                                    alt={m.media.file_name}
                                    className="max-h-64 w-full rounded-xl border border-white/10 object-cover"
                                  />
                                </button>
                              ) : m.media.file_type === 'video' ? (
                                <video
                                  src={m.media.file_url}
                                  controls
                                  className="max-h-64 w-full rounded-xl border border-white/10 bg-black"
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => window.open(m.media!.file_url, '_blank', 'noopener,noreferrer')}
                                  className={`text-sm font-bold underline ${isCurrentUser ? 'text-white' : 'text-primary-700'}`}
                                >
                                  {m.media.file_name}
                                </button>
                              )}
                            </div>
                          )}

                          <div className="text-sm">{m.message}</div>
                          <div className={`text-[10px] mt-1 ${isCurrentUser ? 'text-white/70' : 'text-slate-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100">
                {attachment && attachmentPreviewUrl && (
                  <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachmentPreviewUrl}
                          alt={attachment.name}
                          className="h-10 w-10 rounded-lg border border-slate-200 object-cover bg-white"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-slate-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{attachment.name}</div>
                        <div className="text-xs text-slate-500 truncate">{attachment.type || 'file'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg hover:bg-slate-50 text-slate-600"
                    aria-label="Attach photo or video"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSending || (!messageText.trim() && !attachment)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow shadow-primary-200 disabled:opacity-70"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          )}
          {!activeThread && (
            <div className="flex items-center justify-center h-full text-sm font-semibold text-slate-500">
              No jobs available for chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
