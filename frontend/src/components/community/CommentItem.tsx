import React, { useState } from 'react';

const CommentItem = ({ comment, onReply }: { comment: any; onReply: (id: string) => void }) => {
  const [openReply, setOpenReply] = useState(false);
  return (
    <div className="pl-4 border-l ml-2">
      <div className="text-sm">
        <span className="font-semibold">{comment.author?.name || 'User'}</span>
        <span className="ml-2 text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <div className="text-sm mt-1">{comment.text}</div>
      <div className="mt-2 text-xs text-muted-foreground">
        <button onClick={() => { setOpenReply((s) => !s); onReply(comment.id); }} className="mr-3">Reply</button>
      </div>
    </div>
  );
};

export default CommentItem;
