import React from 'react';

const MediaRenderer = ({ media }: { media?: any[] }) => {
  if (!media || media.length === 0) return null;
  const item = media[0];
  if (!item) return null;

  const type = (item.mediaType || item.type || '').toLowerCase();

  if (type.includes('image') || /\.(png|jpe?g|gif|webp)$/.test(item.url || '')) {
    return <img src={item.url} alt={item.fileName || 'image'} className="w-full max-h-72 object-cover rounded-md" />;
  }

  if (type.includes('video') || /\.(mp4|webm|ogg)$/.test(item.url || '')) {
    return (
      <video controls className="w-full max-h-72 rounded-md">
        <source src={item.url} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (type.includes('audio') || /\.(mp3|wav|ogg)$/.test(item.url || '')) {
    return (
      <audio controls className="w-full">
        <source src={item.url} />
      </audio>
    );
  }

  // Document/PDF or fallback
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="block p-3 border rounded-md text-sm text-muted-foreground">
      {item.fileName || 'Attachment'}
    </a>
  );
};

export default MediaRenderer;
