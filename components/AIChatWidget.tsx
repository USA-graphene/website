'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: 'Hello! I am **Carbon**, your Graphene technical consultant. Ask me anything about our materials, applications, or specifications.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response (Mock for now)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "I'm currently in **Simulated Mode**. Once connected to the backend, I'll be able to answer specific questions about USA Graphene products using our technical documentation."
            }]);
            setIsTyping(false);
        }, 1500);
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
                        {/* Hexagonal Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {/* Header */}
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
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Messages Area */}
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
                                            <div className="mb-1 text-[10px] text-cyan-400/80 font-mono tracking-wider mb-2">● CARBON AI</div>
                                        )}
                                        {msg.content}
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

                        {/* Input Area */}
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

            {/* Trigger Button - Large Hexagon */}
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
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse"></div>

                {/* Hexagon Shape */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center shadow-2xl border border-cyan-500/30 transition-colors group-hover:border-cyan-400/50"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                    {/* Inner Content */}
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

                    {/* Hexagon Highlight Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
                </div>
            </motion.button>
        </div>
    );
}
