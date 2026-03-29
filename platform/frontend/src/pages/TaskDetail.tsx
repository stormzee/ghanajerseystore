import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Tag, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { getTask, getCollaborators, joinTask, leaveTask } from '../api';
import type { Task, Collaborator } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [collabs, setCollabs] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const taskId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!taskId) return;
    Promise.all([getTask(taskId), getCollaborators(taskId)])
      .then(([t, c]) => {
        setTask(t);
        setCollabs(c);
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  const isOwner = user?.id === task?.owner_id;
  const isCollab = collabs.some((c) => c.user_id === user?.id);

  const handleJoin = async () => {
    if (!taskId) return;
    setJoining(true);
    try {
      await joinTask(taskId);
      const c = await getCollaborators(taskId);
      setCollabs(c);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!taskId) return;
    setJoining(true);
    try {
      await leaveTask(taskId);
      const c = await getCollaborators(taskId);
      setCollabs(c);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        Task not found.{' '}
        <button onClick={() => navigate(-1)} className="text-brand-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
              task.is_open
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {task.is_open ? 'Open' : 'Closed'}
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">{task.description}</p>

        {task.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {task.tags.split(',').map((t) => (
              <span
                key={t.trim()}
                className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2.5 py-0.5"
              >
                <Tag className="w-3 h-3" />
                {t.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>
            Posted by <strong className="text-gray-700">@{task.owner_username}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {collabs.length} collaborator{collabs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!isOwner && task.is_open && !isCollab && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
            >
              {joining ? 'Joining…' : 'Join task'}
            </button>
          )}
          {!isOwner && isCollab && (
            <button
              onClick={handleLeave}
              disabled={joining}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Leave task
            </button>
          )}
          <Link
            to={`/messages/${task.owner_id}`}
            className="flex items-center gap-1.5 px-4 py-2 border border-brand-200 text-brand-600 text-sm font-medium rounded-xl hover:bg-brand-50 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Message owner
          </Link>
        </div>
      </div>

      {/* Collaborators */}
      {collabs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Collaborators</h3>
          <div className="space-y-2">
            {collabs.map((c) => (
              <div
                key={c.user_id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-800">@{c.username}</span>
                <Link
                  to={`/messages/${c.user_id}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Message
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
