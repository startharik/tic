import React, { useMemo, useState } from 'react';
import { Search, Paperclip, Send, Phone, Video, Info } from 'lucide-react';

type Thread = {
  id: string;
  title: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
};

type Message = {
  id: string;
  from: 'admin' | 'engineer';
  text: string;
  time: string;
};

const threads: Thread[] = [
  {
    id: 't1',
    title: 'John Doe (Engineer)',
    subtitle: 'Job JB-2024-001 • Saudi Aramco',
    lastMessage: 'Please upload the nameplate photos with watermark.',
    lastTime: '10:45 AM',
    unread: 2,
  },
  {
    id: 't2',
    title: 'Jane Smith (Engineer)',
    subtitle: 'Job JB-2024-002 • SABIC',
    lastMessage: 'Arrived at site. Starting checklist now.',
    lastTime: 'Yesterday',
    unread: 0,
  },
  {
    id: 't3',
    title: 'Operations Broadcast',
    subtitle: 'All Engineers',
    lastMessage: 'Reminder: Follow updated PPE procedure for confined spaces.',
    lastTime: 'Mon',
    unread: 1,
  },
];

const messagesByThread: Record<string, Message[]> = {
  t1: [
    { id: 'm1', from: 'engineer', text: 'I have checked in to the site.', time: '10:31 AM' },
    { id: 'm2', from: 'admin', text: 'Great. Please take clear photos of the nameplate.', time: '10:34 AM' },
    { id: 'm3', from: 'engineer', text: 'Understood. Capturing now.', time: '10:36 AM' },
    { id: 'm4', from: 'admin', text: 'Please upload the nameplate photos with watermark.', time: '10:45 AM' },
  ],
  t2: [
    { id: 'm1', from: 'admin', text: 'Any update on the SABIC audit?', time: '9:05 AM' },
    { id: 'm2', from: 'engineer', text: 'Arrived at site. Starting checklist now.', time: '9:12 AM' },
  ],
  t3: [
    { id: 'm1', from: 'admin', text: 'Reminder: Follow updated PPE procedure for confined spaces.', time: 'Mon 08:30 AM' },
  ],
};

const ChatPage: React.FC = () => {
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id ?? '');
  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId) ?? threads[0], [activeThreadId]);
  const activeMessages = messagesByThread[activeThreadId] ?? [];

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
                placeholder="Search engineer or job ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveThreadId(t.id)}
                className={`w-full text-left px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  activeThreadId === t.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700">
                      {t.title
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{t.title}</div>
                      <div className="text-xs text-slate-500 truncate">{t.subtitle}</div>
                      <div className="text-xs text-slate-600 truncate mt-1">{t.lastMessage}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-slate-500 font-semibold">{t.lastTime}</div>
                    {t.unread > 0 && (
                      <div className="mt-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary-600 text-white text-[11px] font-bold">
                        {t.unread}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center font-extrabold text-primary-700 text-xs">
                {activeThread?.title
                  ?.split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{activeThread?.title}</div>
                <div className="text-xs text-slate-500 truncate">{activeThread?.subtitle}</div>
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
              {activeMessages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                    m.from === 'admin'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-900 border-slate-100'
                  }`}>
                    <div className="text-sm">{m.text}</div>
                    <div className={`text-[10px] mt-1 ${m.from === 'admin' ? 'text-white/70' : 'text-slate-400'}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-600">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 shadow shadow-primary-200">
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
