import React, { useEffect, useRef } from 'react';
import { PostWithCounts } from '../hooks/usePosts';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommentSection } from './CommentSection';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { formatDistanceToNow } from 'date-fns';

interface LightboxProps {
  post: PostWithCounts | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ post, isOpen, onClose }: LightboxProps) {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-background border-white/10 glass-panel shadow-2xl flex flex-col md:flex-row gap-0">
        <VisuallyHidden>
          <DialogTitle>Post Lightbox</DialogTitle>
          <DialogDescription>Viewing full size post and comments</DialogDescription>
        </VisuallyHidden>
        
        {/* Left side: Media */}
        <div className="flex-1 bg-black/50 relative flex items-center justify-center overflow-hidden">
          {post.media_type === 'video' ? (
            <video 
              src={post.media_url} 
              controls 
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={post.media_url} 
              alt={post.caption}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Right side: Info + Comments */}
        <div className="w-full md:w-[380px] h-[40vh] md:h-full flex flex-col bg-card shrink-0">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-white/40 font-mono tracking-wider uppercase">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
              {post.caption}
            </p>
          </div>
          <div className="flex-1 min-h-0 relative">
             <CommentSection postId={post.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
