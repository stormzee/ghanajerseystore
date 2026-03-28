import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Send, Paperclip, Loader2, Lock, Clock } from 'lucide-react';
import { getConversation, sendMessage, getUser, uploadMedia } from '../api';
import type { Message, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCrypto } from '../contexts/CryptoContext';
import { useMessageSocket } from '../contexts/useMessageSocket';
import type { WsEvent } from '../types';
import { formatDistanceToNow } from 'date-fns';
import MediaUpload from './MediaUpload';

interface Props {
  peerId: number;
}

interface DecryptedMessage extends Message {
  plaintext: string;
}

export default function ChatWindow({ peerId }: Props) {
  const { user } = useAuth();
  const { encryptForRecipient, decryptMessage, ready: cryptoReady } = useCrypto();
  const [peer, setPeer] = useState<User | null>(null);
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const decryptOne = useCallback(
    async (msg: Message): Promise<DecryptedMessage> => {
      try {
        if (msg.encrypted_key && msg.iv) {
          const plain = await decryptMessage(msg.ciphertext, msg.encrypted_key, msg.iv);
          return { ...msg, plaintext: plain };
        }
        // Fallback: server might have stored an unencrypted plaintext (for old msgs)
        return { ...msg, plaintext: msg.ciphertext };
      } catch {
        return { ...msg, plaintext: '[encrypted message]' };
      }
    },
    [decryptMessage]
  );

  const loadMessages = useCallback(async () => {
    if (!cryptoReady) return;
    setLoading(true);
    try {
      const raw = await getConversation(peerId);
      const decrypted = await Promise.all(raw.map(decryptOne));
      setMessages(decrypted);
    } finally {
      setLoading(false);
    }
  }, [peerId, cryptoReady, decryptOne]);

  useEffect(() => {
    getUser(peerId).then(setPeer);
  }, [peerId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Receive real-time messages
  const handleWsEvent = useCallback(
    async (event: WsEvent) => {
      if (
        event.type === 'message' &&
        (event.data.sender_id === peerId || event.data.recipient_id === peerId)
      ) {
        const decrypted = await decryptOne(event.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === decrypted.id)) return prev;
          return [...prev, decrypted];
        });
      }
    },
    [peerId, decryptOne]
  );

  useMessageSocket(handleWsEvent, !!user);

  const handleSend = async (mediaUrl?: string, mediaType?: string) => {
    if (!peer?.public_key) {
      alert("Recipient has no public key – can't encrypt message.");
      return;
    }
    if (!text.trim() && !mediaUrl) return;

    setSending(true);
    try {
      const payload = text.trim() || '[media]';
      const encrypted = await encryptForRecipient(payload, peer.public_key);
      const msg = await sendMessage({
        recipient_id: peerId,
        ciphertext: encrypted.ciphertext,
        encrypted_key: encrypted.encrypted_key,
        iv: encrypted.iv,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      const decrypted = await decryptOne(msg);
      setMessages((prev) => [...prev, decrypted]);
      setText('');
      setShowMediaUpload(false);
    } finally {
      setSending(false);
    }
  };

  const handleMediaUploaded = async (url: string, contentType: string) => {
    await handleSend(url, contentType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {peer ? `@${peer.username}` : '…'}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> End-to-end encrypted
            &nbsp;·&nbsp;
            <Clock className="w-3 h-3" /> messages disappear in 8 h
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 pt-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const expires = new Date(msg.expires_at);
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.media_url && (
                    <div className="mb-2">
                      {msg.media_type?.startsWith('image/') ? (
                        <img
                          src={msg.media_url}
                          alt="media"
                          className="rounded-lg max-w-full"
                        />
                      ) : (
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs underline ${isMine ? 'text-brand-100' : 'text-brand-600'}`}
                        >
                          📎 {msg.media_type ?? 'File'}
                        </a>
                      )}
                    </div>
                  )}
                  {msg.plaintext !== '[media]' && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.plaintext}
                    </p>
                  )}
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? 'text-brand-200' : 'text-gray-400'
                    }`}
                  >
                    expires {formatDistanceToNow(expires, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Media upload panel */}
      {showMediaUpload && (
        <div className="border-t border-gray-100 px-4 py-3">
          <MediaUpload
            onUploaded={handleMediaUploaded}
            onCancel={() => setShowMediaUpload(false)}
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-end gap-2">
        <button
          onClick={() => setShowMediaUpload((v) => !v)}
          className="text-gray-400 hover:text-brand-600 transition p-1"
          title="Attach media"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32"
        />
        <button
          onClick={() => handleSend()}
          disabled={sending || (!text.trim())}
          className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
}
