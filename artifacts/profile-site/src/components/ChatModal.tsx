import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateMessage } from '../hooks/useMessages';
import { useProfile } from '../hooks/useProfile';
import { ArrowLeft, Send, Loader2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const introSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60).trim(),
  email: z.string().email('Valid email required'),
});
type IntroValues = z.infer<typeof introSchema>;

interface ChatMessage {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatModal({ isOpen, onOpenChange }: ChatModalProps) {
  const { data: profile } = useProfile();
  const createMessage = useCreateMessage();

  const [phase, setPhase] = useState<'intro' | 'chat'>('intro');
  const [sender, setSender] = useState({ name: '', email: '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const form = useForm<IntroValues>({
    resolver: zodResolver(introSchema),
    defaultValues: { name: '', email: '' },
  });

  useEffect(() => {
    if (isOpen) {
      setPhase('intro');
      setMessages([]);
      setText('');
      form.reset();
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onIntroSubmit = (data: IntroValues) => {
    setSender(data);
    setPhase('chat');
    setMessages([
      {
        id: 'intro',
        text: `Hi! I'm ${data.name} 👋`,
        fromMe: true,
        time: now(),
      },
    ]);
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: msgId, text: trimmed, fromMe: true, time: now() }]);
    setText('');

    createMessage.mutate(
      { name: sender.name, email: sender.email, message: trimmed },
      {
        onError: () => {
          setMessages(prev => prev.filter(m => m.id !== msgId));
        },
      }
    );
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const avatar = profile?.profile_picture_url;
  const displayName = profile?.name || 'Creator';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-sm w-full border-0 overflow-hidden rounded-2xl bg-[#111111]"
        style={{ height: '600px', maxHeight: '90vh' }}>

        <AnimatePresence mode="wait">
          {phase === 'intro' ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="bg-[#1a1a2e] px-5 pt-8 pb-6 text-center border-b border-white/5">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-primary/40">
                  {avatar
                    ? <img src={avatar} className="w-full h-full object-cover" alt={displayName} />
                    : <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <span className="font-serif text-2xl text-primary">{displayName[0]}</span>
                      </div>
                  }
                </div>
                <h2 className="text-white font-semibold text-lg">{displayName}</h2>
                <p className="text-white/40 text-xs mt-1">Send a message</p>
              </div>

              {/* Form */}
              <div className="flex-1 flex flex-col justify-center px-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <p className="text-white/60 text-sm">Introduce yourself to start chatting</p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onIntroSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Your email"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium mt-2"
                    >
                      Start Chat
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="flex flex-col h-full"
            >
              {/* WhatsApp-style header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] border-b border-white/5">
                <button
                  onClick={() => setPhase('intro')}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  {avatar
                    ? <img src={avatar} className="w-full h-full object-cover" alt={displayName} />
                    : <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <span className="font-serif text-sm text-primary">{displayName[0]}</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">{displayName}</p>
                  <p className="text-green-400 text-xs">online</p>
                </div>
              </div>

              {/* Chat area */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
                style={{
                  background: 'linear-gradient(180deg, #0d0d1a 0%, #111118 100%)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236c63ff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.fromMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white/10 text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.fromMe ? 'text-white/60' : 'text-white/40'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-3 bg-[#1a1a2e] border-t border-white/5">
                <Input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Message..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full h-10 px-4"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!text.trim() || createMessage.isPending}
                  className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  {createMessage.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
