import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  ArrowLeft,
  MessageSquare,
  Trash2,
  User,
  Bot,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Character, Conversation, Message, RelationshipData } from '../types';
import {
  cn,
  formatRelativeTime,
  formatTime,
  STAGE_LABELS,
  STAGE_COLORS,
  EMOTION_EMOJIS,
  COLOR_THEME_ACCENT,
} from '../utils';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-[typing-bounce_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load character and conversations on mount
  useEffect(() => {
    if (!characterId) return;

    async function init() {
      try {
        const [charRes, convRes] = await Promise.all([
          api.get(`/characters/${characterId}`),
          api.get('/conversations', { params: { characterId } }),
        ]);
        setCharacter(charRes.data.character);
        setRelationship(charRes.data.relationship);
        const convs: Conversation[] = convRes.data.conversations;
        setConversations(convs);

        // Auto-open the most recent conversation or create a new one
        if (convs.length > 0) {
          loadConversation(convs[0].id);
        }
      } catch {
        navigate('/characters');
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConversationId(convId);
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/conversations/${convId}/messages`);
      setMessages(data.messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function createNewConversation() {
    if (!characterId) return;
    try {
      const { data } = await api.post('/conversations', {
        characterId,
        title: `Chat with ${character?.name}`,
      });
      const newConv = data.conversation;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch {
      toast.error('Failed to create conversation');
    }
  }

  async function handleSend() {
    if (!input.trim() || !activeConversationId || sending) return;

    const userText = input.trim();
    setInput('');
    setSending(true);

    // Optimistic message
    const optimisticMsg: Message = {
      id: `tmp-${Date.now()}`,
      conversationId: activeConversationId,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data } = await api.post(`/conversations/${activeConversationId}/messages`, {
        content: userText,
      });

      // Replace optimistic + add AI reply
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticMsg.id),
        { ...optimisticMsg, id: data.message.id }, // confirmed user msg isn't returned separately, but we use the optimistic
        data.message,
      ]);

      // Update relationship if changed
      if (data.relationship) {
        setRelationship(data.relationship);
      }

      // Refresh character to get latest emotion
      api.get(`/characters/${characterId}`).then(({ data: charData }) => {
        setCharacter(charData.character);
        setRelationship(charData.relationship);
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Failed to send message');
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setInput(userText); // restore input
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function deleteConversation(convId: string) {
    try {
      await api.delete(`/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  const stage = relationship?.stage || 'STRANGER';
  const emotion = character?.emotionalState?.currentEmotion || 'calm';

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-30 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/characters" className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            {character && (
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
                  }}
                />
                <span className="font-medium text-sm truncate">{character.name}</span>
              </div>
            )}
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-3 border-b border-border">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-start gap-2 px-3 py-3 cursor-pointer border-b border-border/50 hover:bg-muted/50 transition-colors',
                  activeConversationId === conv.id && 'bg-muted'
                )}
                onClick={() => {
                  loadConversation(conv.id);
                  setSidebarOpen(false);
                }}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title || 'Conversation'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(conv.updatedAt)}
                  </p>
                  {conv.messages?.[0] && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Character Profile Link */}
        {character && (
          <div className="p-3 border-t border-border">
            <Link
              to={`/characters/${character.id}`}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              View Profile
            </Link>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        {character && (
          <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative shrink-0">
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-9 h-9 rounded-full object-cover border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">{character.name}</h2>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STAGE_COLORS[stage])}>
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Active</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {EMOTION_EMOJIS[emotion as keyof typeof EMOTION_EMOJIS]} {emotion}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1">
              <Bot className="w-3 h-3" />
              AI Character
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {!activeConversationId ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              {character && (
                <>
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{character.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      {character.tagline}
                    </p>
                  </div>
                  <button
                    onClick={createNewConversation}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Start a Conversation
                  </button>
                </>
              )}
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Say something to start the conversation
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex gap-2 mb-3',
                      msg.role === 'USER' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'ASSISTANT' && character && (
                      <img
                        src={character.avatarUrl}
                        alt={character.name}
                        className="w-7 h-7 rounded-full object-cover border border-border self-end shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${character.name}`;
                        }}
                      />
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'USER'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1 text-right',
                          msg.role === 'USER' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                        )}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {sending && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeConversationId && (
          <div className="px-4 py-3 border-t border-border bg-card">
            {character && (
              <p className={cn('text-xs mb-2 text-muted-foreground/60', COLOR_THEME_ACCENT[character.personalityJson?.colorTheme || 'blue'])}>
                Chatting with {character.name} · AI Character
              </p>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                disabled={sending}
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-32 overflow-y-auto"
                style={{ minHeight: '42px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="shrink-0 p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
