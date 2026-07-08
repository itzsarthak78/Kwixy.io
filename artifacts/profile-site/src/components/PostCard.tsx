import React from 'react';
import { PostWithCounts } from '../hooks/usePosts';
import { MessageCircle, Pin } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: PostWithCounts;
  onClick: (post: PostWithCounts) => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative cursor-pointer rounded-2xl overflow-hidden glass-panel aspect-[4/5] sm:aspect-[3/4]"
      onClick={() => onClick(post)}
    >
      <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 group-hover:bg-black/0" />
      
      {post.media_type === 'video' ? (
        <video 
          src={post.media_url} 
          className="w-full h-full object-cover"
          muted 
          loop 
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : (
        <img 
          src={post.media_url} 
          alt={post.caption}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Overlays */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {post.pinned && (
          <div className="bg-primary/90 text-white backdrop-blur-md p-2 rounded-full shadow-lg">
            <Pin className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-medium line-clamp-2 text-sm mb-3 text-glow shadow-black">
          {post.caption}
        </p>
        <div className="flex items-center gap-2 text-white/80">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">{post.comments_count}</span>
        </div>
      </div>
    </motion.div>
  );
}
