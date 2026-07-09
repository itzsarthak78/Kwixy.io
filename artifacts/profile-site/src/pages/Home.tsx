import React, { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { usePosts, PostWithCounts } from '../hooks/usePosts';
import { Lightbox } from '../components/Lightbox';
import { ChatModal } from '../components/ChatModal';
import { MessageCircle, Play, ArrowUp, Loader2, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as SiIcons from 'react-icons/si';

/* ── helpers ── */
const getIcon = (platform: string) => {
  const name = `Si${platform.charAt(0).toUpperCase()}${platform.slice(1).toLowerCase()}`;
  const Icon = (SiIcons as any)[name];
  return Icon ? <Icon className="w-4 h-4" /> : <Link2 className="w-4 h-4" />;
};

function Avatar({
  src,
  name,
  className = '',
  textClass = 'text-2xl',
}: {
  src?: string | null;
  name: string;
  className?: string;
  textClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`bg-[#272729] flex items-center justify-center ${className}`}>
      <span className={`font-bold text-[#818384] ${textClass}`}>{name?.[0]?.toUpperCase() || '?'}</span>
    </div>
  );
}

/* ── main ── */
export default function Home() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const [activePost, setActivePost] = useState<PostWithCounts | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (profileLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff4500]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-center px-4">
        <div>
          <div className="w-20 h-20 rounded-full bg-[#1a1a1b] border border-[#343536] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-[#818384]">?</span>
          </div>
          <h2 className="text-[#d7dadc] text-sm font-medium">No profile found</h2>
          <p className="text-[#818384] text-xs mt-1">Log in to the admin dashboard to set up your profile.</p>
        </div>
      </div>
    );
  }

  const postCount = posts?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#d7dadc]">

      {/* ── Banner ── */}
      {profile.banner_url && (
        <div className="w-full h-32 sm:h-48 overflow-hidden bg-[#1a1a1b]">
          <img
            src={profile.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* ── Page shell ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* ══ LEFT SIDEBAR (profile card) ══ */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden bg-[#1a1a1b] border border-[#343536] sticky top-6"
            >
              {/* Mini banner strip */}
              <div className="h-16 bg-gradient-to-r from-[#ff4500]/30 via-[#ff6534]/20 to-[#ff4500]/10 relative">
                {profile.banner_url && (
                  <img
                    src={profile.banner_url}
                    alt=""
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Avatar — overlaps banner */}
              <div className="px-4 pb-4">
                <div className="-mt-8 mb-3">
                  <div className="w-16 h-16 rounded-full ring-4 ring-[#1a1a1b] overflow-hidden bg-[#272729]">
                    <Avatar src={profile.profile_picture_url} name={profile.name} className="w-full h-full" textClass="text-2xl" />
                  </div>
                </div>

                <h1 className="text-[#d7dadc] font-bold text-base leading-tight">{profile.name}</h1>

                {profile.bio && (
                  <p className="text-[#ff4500] text-xs font-semibold mt-0.5 tracking-wide">{profile.bio}</p>
                )}

                {profile.about && (
                  <p className="text-[#818384] text-xs leading-relaxed mt-2">{profile.about}</p>
                )}

                {/* Karma-style stats */}
                <div className="mt-4 pt-4 border-t border-[#343536] grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[#d7dadc] font-bold text-sm">{postCount}</p>
                    <p className="text-[#818384] text-xs">Posts</p>
                  </div>
                  <div>
                    <p className="text-[#d7dadc] font-bold text-sm">∞</p>
                    <p className="text-[#818384] text-xs">Karma</p>
                  </div>
                </div>

                {/* Social links */}
                {profile.social_links && profile.social_links.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#343536] flex flex-wrap gap-2">
                    {profile.social_links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#272729] hover:bg-[#3c3c3d] border border-[#343536] text-[#818384] hover:text-[#d7dadc] transition-all text-xs"
                      >
                        {getIcon(link.platform)}
                        <span className="capitalize">{link.platform}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Message button */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="mt-4 w-full py-2 rounded-full bg-[#ff4500] hover:bg-[#ff5722] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </motion.div>
          </aside>

          {/* ══ MAIN FEED ══ */}
          <main className="flex-1 min-w-0">

            {/* Mobile profile header */}
            <div className="md:hidden mb-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-[#1a1a1b] border border-[#343536] rounded-2xl p-4"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#272729] flex-shrink-0">
                  <Avatar src={profile.profile_picture_url} name={profile.name} className="w-full h-full" textClass="text-xl" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-[#d7dadc] font-bold text-base">{profile.name}</h1>
                  {profile.bio && <p className="text-[#ff4500] text-xs font-semibold">{profile.bio}</p>}
                  <p className="text-[#818384] text-xs">{postCount} posts</p>
                </div>
              </motion.div>
            </div>

            {/* Feed sort bar */}
            <div className="flex items-center gap-2 mb-4 bg-[#1a1a1b] border border-[#343536] rounded-xl px-4 py-2.5">
              <ArrowUp className="w-4 h-4 text-[#ff4500]" />
              <span className="text-[#d7dadc] text-sm font-bold">Top Posts</span>
            </div>

            {/* Post cards */}
            {posts && posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} onClick={() => setActivePost(post)} />
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1a1b] border border-[#343536] rounded-2xl py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-[#272729] flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📭</span>
                </div>
                <h3 className="text-[#d7dadc] font-bold text-sm">No posts yet</h3>
                <p className="text-[#818384] text-xs mt-1">Posts will appear here once added.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="py-6 text-center border-t border-[#343536] mt-8">
        <p className="text-[10px] text-[#818384] uppercase tracking-[0.2em] font-mono">
          Developed by Sarthak
        </p>
      </footer>

      {/* ── Floating DM Button ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#ff4500] hover:bg-[#ff5722] shadow-lg shadow-[#ff4500]/30 flex items-center justify-center text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Send a message"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* ── Modals ── */}
      <Lightbox post={activePost} isOpen={!!activePost} onClose={() => setActivePost(null)} />
      <ChatModal isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}

/* ── Post Card (Reddit style) ── */
function PostCard({ post, index, onClick }: { post: PostWithCounts; index: number; onClick: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-[#1a1a1b] border border-[#343536] hover:border-[#818384] rounded-2xl overflow-hidden cursor-pointer transition-colors group flex"
    >
      {/* Vote rail */}
      <div className="w-10 flex-shrink-0 flex flex-col items-center justify-start pt-3 gap-1 bg-[#161617]">
        <ArrowUp className="w-5 h-5 text-[#818384] group-hover:text-[#ff4500] transition-colors" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3 flex gap-3">
        <div className="flex-1 min-w-0">
          {/* Caption */}
          {post.caption && (
            <p className="text-[#d7dadc] text-sm font-medium leading-snug line-clamp-2 mb-2">{post.caption}</p>
          )}

          {/* Media preview */}
          {post.media_url && post.media_type === 'image' && (
            imgFailed ? (
              <div className="rounded-lg mb-2 bg-[#272729] h-16 flex items-center justify-center text-[#818384] text-xs border border-[#343536]">
                Image unavailable
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden mb-2 max-h-80 bg-[#272729]">
                <img
                  src={post.media_url}
                  alt={post.caption}
                  className="w-full object-cover max-h-80"
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                />
              </div>
            )
          )}

          {post.media_type === 'video' && !videoFailed && (
            <div
              className="relative rounded-lg overflow-hidden mb-2 bg-[#272729] flex items-center justify-center"
              style={{ height: '160px' }}
            >
              <video
                src={post.media_url}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoFailed(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span className="text-white text-xs font-medium">Play</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-[#818384] text-xs">
            <button className="flex items-center gap-1.5 hover:text-[#d7dadc] transition-colors py-1 px-2 rounded hover:bg-[#272729]">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.comments_count} Comments</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
