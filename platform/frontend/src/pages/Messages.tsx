import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getConversations } from '../api';
import type { ConversationSummary } from '../types';
import ChatWindow from '../components/ChatWindow';
import { useMessageSocket } from '../contexts/useMessageSocket';
import type { WsEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const { peerId: peerIdParam } = useParams<{ peerId?: string }>();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeerId, setActivePeerId] = useState<number | null>(
    peerIdParam ? parseInt(peerIdParam, 10) : null
  );

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (peerIdParam) setActivePeerId(parseInt(peerIdParam, 10));
  }, [peerIdParam]);

  // Refresh conversation list when a new message arrives
  const handleWsEvent = useCallback(
    (event: WsEvent) => {
      if (event.type === 'message') {
        loadConversations();
      }
    },
    [loadConversations]
  );

  useMessageSocket(handleWsEvent, !!user);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex gap-4 h-[calc(100vh-80px)]">
      {/* Conversation list */}
      <aside className="w-72 shrink-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10 px-4">
            No messages yet. Join a task and start a conversation!
          </p>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.map(({ peer, last_message_at, unread_count }) => (
              <li key={peer.id}>
                <button
                  onClick={() => setActivePeerId(peer.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                    activePeerId === peer.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">@{peer.username}</span>
                    {unread_count > 0 && (
                      <span className="text-xs bg-brand-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                        {unread_count}
                      </span>
                    )}
                  </div>
                  {last_message_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(last_message_at), { addSuffix: true })}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Chat window */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        {activePeerId ? (
          <ChatWindow peerId={activePeerId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
