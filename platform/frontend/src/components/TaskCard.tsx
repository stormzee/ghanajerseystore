import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Tag, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '../types';

interface Props {
  task: Task;
  similarity?: number;
}

export default function TaskCard({ task, similarity }: Props) {
  const tags = task.tags ? task.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <Link to={`/tasks/${task.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {similarity !== undefined && (
              <span className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5">
                {Math.round(similarity * 100)}% match
              </span>
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                task.is_open
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {task.is_open ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 text-xs bg-brand-50 text-brand-600 rounded-full px-2 py-0.5"
              >
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>@{task.owner_username}</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {task.collaborator_count}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
