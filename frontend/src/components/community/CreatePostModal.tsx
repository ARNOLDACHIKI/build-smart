import React, { useState } from 'react';
import { useLocalCommunity } from '@/hooks/useLocalCommunity';

const CreatePostModal = ({ onClose }: { onClose?: () => void }) => {
  const { addPost } = useLocalCommunity() as any;
  const [tab, setTab] = useState<'text'|'image'|'video'|'doc'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    addPost({ title: title.trim(), content: content.trim(), tags: tags.split(',').map(s=>s.trim()).filter(Boolean)});
    onClose?.();
  };

  return (
    <div className="p-4 bg-background border rounded">
      <div className="flex gap-2 mb-3">
        <button className={`px-3 py-1 ${tab==='text'?'bg-primary text-primary-foreground rounded':'border rounded'}`} onClick={() => setTab('text')}>Text</button>
        <button className={`px-3 py-1 ${tab==='image'?'bg-primary text-primary-foreground rounded':'border rounded'}`} onClick={() => setTab('image')}>Image</button>
        <button className={`px-3 py-1 ${tab==='video'?'bg-primary text-primary-foreground rounded':'border rounded'}`} onClick={() => setTab('video')}>Video</button>
        <button className={`px-3 py-1 ${tab==='doc'?'bg-primary text-primary-foreground rounded':'border rounded'}`} onClick={() => setTab('doc')}>Document</button>
      </div>

      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full mb-2 p-2 border rounded" />
      <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Content" className="w-full p-2 border rounded mb-2" />
      <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="tags, comma separated" className="w-full p-2 border rounded mb-2" />

      <div className="flex gap-2">
        <button onClick={submit} className="px-3 py-1 bg-primary text-primary-foreground rounded">Post</button>
        <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
};

export default CreatePostModal;
