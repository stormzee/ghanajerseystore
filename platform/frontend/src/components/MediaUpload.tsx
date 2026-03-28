import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadMedia } from '../api';

interface Props {
  onUploaded: (url: string, contentType: string) => void;
  onCancel: () => void;
}

const ACCEPTED = 'image/*,video/mp4,video/webm,audio/mpeg,audio/ogg,application/pdf';

export default function MediaUpload({ onUploaded, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setError(null);
    if (f.size > 20 * 1024 * 1024) {
      setError('File is too large (max 20 MB)');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSend = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadMedia(file);
      onUploaded(result.url, result.content_type);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-200 rounded-xl p-4"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Attach a file</span>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {preview ? (
        <div className="relative mb-3">
          <img src={preview} alt="preview" className="max-h-40 rounded-lg object-contain" />
          <button
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      ) : file ? (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
          <span>📎</span>
          <span className="truncate max-w-xs">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-6 text-gray-400 hover:text-brand-600 transition"
        >
          <Upload className="w-8 h-8" />
          <span className="text-xs">Click or drag & drop to select a file</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {file && (
        <button
          onClick={handleSend}
          disabled={uploading}
          className="w-full bg-brand-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : 'Send file'}
        </button>
      )}
    </div>
  );
}
