'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type UiMessage = {
    role: 'user' | 'ai';
    content: string;
    sources?: { title: string; url: string; type: string }[];
    handoff?: {
        needsContact?: boolean;
        label?: string;
        url?: string;
    };
};

const STARTER_MESSAGE: UiMessage = {
    role: 'ai',
    content: 'Hello! I am Carbon, your graphene technical consultant. Ask me about products, applications, equipment, or blog topics and I’ll answer from the USA Graphene site knowledge base.'
};

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<UiMessage[]>([STARTER_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = window.localStorage.getItem('carbon-chat-history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            } catch {
                // Ignore invalid local cache
            }
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('carbon-chat-history', JSON.stringify(messages.slice(-20)));
    }, [messages]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedMessages.map((message) => ({
                        role: message.role === 'ai' ? 'assistant' : 'user',
                        content: message.content,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Chat request failed');
            }

            const needsContact = Boolean(data?.intent?.wantsQuote || data?.intent?.wantsSample || data?.intent?.wantsDemo || data?.intent?.asksAvailability);

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: data.answer,
                    sources: Array.isArray(data.sources) ? data.sources : [],
                    handoff: needsContact
                        ? {
                            needsContact: true,
                            label: 'Contact USA Graphene',
                            url: '/contact/',
                        }
                        : undefined,
                },
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: `I hit a backend issue: ${message}. Once the API key and backend are configured, I can answer live from the USA Graphene knowledge base.`,
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const resetChat = () => {
        setMessages([STARTER_MESSAGE]);
        window.localStorage.removeItem('carbon-chat-history');
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-140px)] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto ring-1 ring-white/5 relative"
                    >
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-900 to-black border-b border-white/10 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 animate-pulse opacity-20" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                                    <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                        <div className="w-full h-full bg-black flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                            <span className="text-cyan-400 text-xs font-bold">C</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white tracking-wide">CARBON</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Online</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetChat}
                                    className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-cyan-300 transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent relative z-10">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-lg backdrop-blur-md ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white rounded-2xl rounded-tr-sm border border-white/10'
                                            : 'bg-white/5 text-gray-200 rounded-2xl rounded-tl-sm border border-white/5'
                                            }`}
                                    >
                                        {msg.role === 'ai' && (
                                            <div className="text-[10px] text-cyan-400/80 font-mono tracking-wider mb-2">● CARBON AI</div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        {msg.role === 'ai' && msg.handoff?.needsContact && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <a
                                                    href={msg.handoff.url || '/contact/'}
                                                    className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-all"
                                                >
                                                    {msg.handoff.label || 'Contact USA Graphene'}
                                                </a>
                                            </div>
                                        )}
                                        {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Related sources</div>
                                                <div className="space-y-1.5">
                                                    {msg.sources.slice(0, 4).map((source) => (
                                                        <a
                                                            key={`${source.type}-${source.url}`}
                                                            href={source.url}
                                                            target={source.url.startsWith('http') ? '_blank' : undefined}
                                                            rel={source.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                            className="block text-xs text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                                                        >
                                                            {source.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/60 backdrop-blur-md relative z-10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-3"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about technical specs..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-light"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-10 h-10 flex items-center justify-center bg-cyan-600 text-black rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-900/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={{
                    y: [0, -8, 0],
                    rotate: isOpen ? 90 : 0
                }}
                transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 0.3 }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 pointer-events-auto relative group focus:outline-none"
            >
                <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse"></div>

                <div
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-2xl border border-cyan-500/30 transition-colors group-hover:border-cyan-400/50"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                    <div className="relative z-10 text-cyan-400 group-hover:text-white transition-colors">
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.svg
                                    key="close"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </motion.svg>
                            ) : (
                                <motion.svg
                                    key="chat"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </motion.svg>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                </div>
            </motion.button>
        </div>
    );
}
