import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Loader2 } from 'lucide-react';
import { listTasks, searchSimilarTasks } from '../api';
import type { Task, SimilarTask } from '../types';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

export default function Feed() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [similarTasks, setSimilarTasks] = useState<SimilarTask[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSimilarTasks([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchSimilarTasks(query.trim());
      setSimilarTasks(results);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSimilarTasks([]);
  };

  const displayTasks = query.trim() ? similarTasks : tasks;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by topic, skill, or idea…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find similar'}
        </button>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-3 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Clear
          </button>
        )}
      </form>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {query.trim() ? `Similar tasks for "${query}"` : 'Latest tasks'}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition"
        >
          <Plus className="w-4 h-4" />
          Post task
        </button>
      </div>

      {/* Task form modal */}
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadTasks();
          }}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          {query.trim() ? 'No similar tasks found.' : 'No tasks yet. Be the first to post!'}
        </div>
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              similarity={'similarity' in task ? (task as SimilarTask).similarity : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
