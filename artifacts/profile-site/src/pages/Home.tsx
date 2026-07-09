import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { usePosts, PostWithCounts } from '../hooks/usePosts';
import { Lightbox } from '../components/Lightbox';
import { ChatModal } from '../components/ChatModal';
import { Button } from '@/components/ui/button';
import { MessageCircle, Grid3X3, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import * as SiIcons from 'react-icons/si';
import { Compass } from 'lucide-react';

const getIcon = (platform: string) => {
  const iconName = `Si${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`;
  const IconComponent = (SiIcons as any)[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : <Compass className="w-4 h-4" />;
};

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const [activePost, setActivePost] = useState<PostWithCounts | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
        <div>
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-white/20" />
          </div>
          <h2 className="text-white/60 text-sm">No profile found</h2>
          <p className="text-white/30 text-xs mt-1">Log in to the admin dashboard to create your profile.</p>
        </div>
      </div>
    );
  }

  const postCount = posts?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Header ── */}
      <div className="max-w-[935px] mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full p-[3px]"
                style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7, #ec4899)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {profile.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="font-serif text-4xl text-primary">{profile.name?.[0] || 'A'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 text-center sm:text-left"
          >
            {/* Name + Message button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-4">
              <h1 className="text-xl font-semibold tracking-tight text-white">{profile.name}</h1>
              <Button
                onClick={() => setIsChatOpen(true)}
                size="sm"
                className="rounded-lg px-4 h-8 bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Message
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 mb-4">
              <div className="text-center sm:text-left">
                <span className="text-white font-semibold text-sm">{postCount}</span>
                <span className="text-white/50 text-sm ml-1">posts</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-[#6c63ff] text-sm font-medium tracking-wide mb-1">{profile.bio}</p>
            )}
            {profile.about && (
              <p className="text-white/70 text-sm leading-relaxed max-w-md">{profile.about}</p>
            )}

            {/* Social links */}
            {profile.social_links && profile.social_links.length > 0 && (
              <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                {profile.social_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all"
                  >
                    {getIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Banner (below header on mobile, shown as a subtle strip) */}
        {profile.banner_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 rounded-2xl overflow-hidden h-32 sm:h-44"
          >
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>

      {/* ── Divider + Tab ── */}
      <div className="border-t border-white/10 max-w-[935px] mx-auto">
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2 py-3 border-t border-white text-white text-xs font-semibold tracking-widest uppercase">
            <Grid3X3 className="w-3.5 h-3.5" />
            Posts
          </div>
        </div>
      </div>

      {/* ── Posts Grid ── */}
      <div className="max-w-[935px] mx-auto px-0 sm:px-4 pb-16">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-[3px] sm:gap-1">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="relative aspect-square cursor-pointer group overflow-hidden bg-white/5"
                onClick={() => setActivePost(post)}
              >
                {post.media_type === 'video' ? (
                  <>
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 text-white drop-shadow-lg">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={post.media_url}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{post.comments_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-white font-semibold mb-1">No Posts Yet</h3>
            <p className="text-white/40 text-sm">When posts are shared they'll appear here.</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono">
          Developed by Sarthak
        </p>
      </footer>

      {/* ── Modals ── */}
      <Lightbox post={activePost} isOpen={!!activePost} onClose={() => setActivePost(null)} />
      <ChatModal isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
