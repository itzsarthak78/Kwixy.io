import React, { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { usePosts, PostWithCounts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { Lightbox } from '../components/Lightbox';
import { ContactModal } from '../components/ContactModal';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

// dynamically import react-icons
import * as SiIcons from 'react-icons/si';

const getIcon = (platform: string) => {
  const iconName = `Si${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`;
  const IconComponent = (SiIcons as any)[iconName];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Compass className="w-5 h-5" />;
};

export default function Home() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: posts, isLoading: isPostsLoading } = usePosts();

  const [activePost, setActivePost] = useState<PostWithCounts | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    // Add dark class to html for this specific app requirement
    document.documentElement.classList.add('dark');
  }, []);

  if (isProfileLoading || isPostsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no profile created yet, show a beautiful fallback
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <div className="space-y-4 max-w-md">
          <h1 className="font-serif text-3xl text-white">No Profile Found</h1>
          <p className="text-white/60 text-sm">Please log in to the admin dashboard and create your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Header / Hero Section */}
      <header className="relative w-full">
        {/* Banner */}
        <div className="h-[40vh] md:h-[50vh] w-full relative">
          {profile.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-primary/20 via-background/50 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 md:-mt-40 z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-background/50 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden mb-6"
          >
            {profile.profile_picture_url ? (
              <img 
                src={profile.profile_picture_url} 
                alt={profile.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-serif text-3xl text-primary">{profile.name?.[0] || 'A'}</span>
              </div>
            )}
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-3"
          >
            {profile.name}
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-primary font-mono text-sm md:text-base tracking-widest uppercase mb-6"
          >
            {profile.bio}
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-2xl text-white/70 leading-relaxed font-light mb-8 text-sm md:text-base"
          >
            {profile.about}
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-6 mb-16"
          >
            <div className="flex gap-4">
              {profile.social_links?.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
                >
                  {getIcon(link.platform)}
                </a>
              ))}
            </div>

            <Button 
              onClick={() => setIsContactOpen(true)}
              className="rounded-full px-8 h-12 bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Mail className="w-4 h-4 mr-2" />
              Message Me
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Posts Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {posts && posts.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard post={post} onClick={setActivePost} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel rounded-3xl max-w-2xl mx-auto border-white/5">
            <Compass className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-white/60 mb-2">The canvas is blank</h3>
            <p className="text-white/40">No posts have been published yet.</p>
          </div>
        )}
      </main>

      <footer className="py-8 text-center border-t border-white/5 bg-background">
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono">
          Developed by Sarthak
        </p>
      </footer>

      {/* Modals */}
      <Lightbox 
        post={activePost} 
        isOpen={!!activePost} 
        onClose={() => setActivePost(null)} 
      />
      
      <ContactModal 
        isOpen={isContactOpen} 
        onOpenChange={setIsContactOpen} 
      />
    </div>
  );
}
