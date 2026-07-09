import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AdminGuard } from '../components/AdminGuard';
import { supabase } from '../lib/supabase';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from '../hooks/usePosts';
import { useMessages, useUpdateMessage, useDeleteMessage } from '../hooks/useMessages';
import { MediaUpload } from '../components/MediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  LogOut, User, Image as ImageIcon, MessageSquare, 
  BarChart, Trash2, Pin, Eye, MailCheck
} from 'lucide-react';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

function ProfileSection() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    name: '', bio: '', about: '', social_links: '[]'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        about: profile.about || '',
        social_links: JSON.stringify(profile.social_links || [], null, 2)
      });
    }
  }, [profile]);

  const handleSave = () => {
    try {
      const parsedLinks = JSON.parse(formData.social_links);
      updateProfile.mutate({
        ...formData,
        social_links: parsedLinks
      }, {
        onSuccess: () => toast.success('Profile saved'),
        onError: (err: any) => toast.error(err.message || 'Failed to save profile')
      });
    } catch (e) {
      toast.error('Invalid JSON in social links');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Profile Media</h3>
          <div className="space-y-2">
            <label className="text-sm text-white/60">Profile Picture</label>
            <MediaUpload
              bucket="profile"
              label="Upload Avatar"
              accept="image/*"
              onUploadSuccess={(url) => updateProfile.mutate(
                { profile_picture_url: url },
                {
                  onSuccess: () => toast.success('Avatar updated'),
                  onError: (err: any) => toast.error(err.message || 'Failed to save avatar'),
                }
              )}
            />
            {profile?.profile_picture_url && (
              <img src={profile.profile_picture_url} className="w-16 h-16 rounded-full object-cover mt-2 border border-white/10" alt="Avatar" />
            )}
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-sm text-white/60">Banner Image</label>
            <MediaUpload
              bucket="banner"
              label="Upload Banner"
              accept="image/*"
              onUploadSuccess={(url) => updateProfile.mutate(
                { banner_url: url },
                {
                  onSuccess: () => toast.success('Banner updated'),
                  onError: (err: any) => toast.error(err.message || 'Failed to save banner'),
                }
              )}
            />
            {profile?.banner_url && (
              <img src={profile.banner_url} className="w-full h-24 rounded-lg object-cover mt-2 border border-white/10" alt="Banner" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 block mb-1">Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Bio (Short)</label>
              <Input 
                value={formData.bio} 
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="bg-white/5 border-white/10 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">About (Long)</label>
              <Textarea 
                value={formData.about} 
                onChange={e => setFormData({ ...formData, about: e.target.value })}
                className="bg-white/5 border-white/10 min-h-[120px]"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 block mb-1">Social Links (JSON)</label>
              <Textarea 
                value={formData.social_links} 
                onChange={e => setFormData({ ...formData, social_links: e.target.value })}
                className="bg-white/5 border-white/10 min-h-[100px] font-mono text-sm"
                placeholder={'[\n  { "platform": "Twitter", "url": "..." }\n]'}
              />
            </div>
            <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
              Save Profile Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsSection() {
  const { data: posts } = usePosts();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [newPost, setNewPost] = useState<{ url: string; type: 'image' | 'video' | null; caption: string }>({
    url: '', type: null, caption: ''
  });

  const handleUploadSuccess = (url: string, mimeType: string) => {
    const type: 'video' | 'image' = mimeType.startsWith('video/') ? 'video' : 'image';
    setNewPost(prev => ({ ...prev, url, type }));
  };

  const handleCreatePost = () => {
    if (!newPost.url || !newPost.type) {
      toast.error('Upload media first');
      return;
    }
    createPost.mutate({
      media_url: newPost.url,
      media_type: newPost.type,
      caption: newPost.caption,
      pinned: false
    }, {
      onSuccess: () => {
        toast.success('Post created');
        setNewPost({ url: '', type: null, caption: '' });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Create new */}
      <div className="glass-panel p-6 rounded-2xl border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Create New Post</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {!newPost.url ? (
              <MediaUpload bucket="posts" onUploadSuccess={handleUploadSuccess} />
            ) : (
              <div className="relative rounded-lg overflow-hidden h-40 bg-black/50 border border-white/10 group">
                {newPost.type === 'video' ? (
                  <video src={newPost.url} className="w-full h-full object-contain" />
                ) : (
                  <img src={newPost.url} className="w-full h-full object-contain" alt="Preview" />
                )}
                <Button 
                  size="sm" variant="destructive" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setNewPost({ url: '', type: null, caption: '' })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Textarea 
              placeholder="Post caption..." 
              value={newPost.caption}
              onChange={e => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
              className="bg-white/5 border-white/10 min-h-[100px]"
            />
            <Button onClick={handleCreatePost} disabled={createPost.isPending || !newPost.url} className="w-full">
              Publish Post
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Your Posts</h3>
        <div className="space-y-3">
          {posts?.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 glass-panel rounded-xl border-white/5">
              <div className="w-16 h-16 rounded-md bg-black/50 overflow-hidden shrink-0">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media_url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 truncate">{post.caption || 'No caption'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40 font-mono">
                  <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{post.comments_count} comments</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="ghost" size="icon" 
                  className={`rounded-full ${post.pinned ? 'text-primary' : 'text-white/40'}`}
                  onClick={() => updatePost.mutate({ id: post.id, pinned: !post.pinned })}
                >
                  <Pin className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel border-white/10 bg-background/90 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/60">
                        This action cannot be undone. This will permanently delete the post and all its comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={() => deletePost.mutate(post.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <p className="text-center text-white/40 py-8">No posts found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MessagesSection() {
  const { data: messages } = useMessages();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Inbox</h3>
      <div className="space-y-2">
        {messages?.map(msg => (
          <div 
            key={msg.id} 
            className={`glass-panel border-l-4 transition-all ${msg.read ? 'border-white/10 opacity-70' : 'border-primary'}`}
          >
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white/90">{msg.name}</span>
                  {!msg.read && <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] px-1.5 py-0 h-4">NEW</Badge>}
                </div>
                <p className={`text-sm truncate ${msg.read ? 'text-white/40' : 'text-white/70'}`}>
                  {msg.message}
                </p>
              </div>
              <div className="text-xs text-white/40 whitespace-nowrap font-mono">
                {format(new Date(msg.created_at), 'MMM d, h:mm a')}
              </div>
            </div>
            
            {expandedId === msg.id && (
              <div className="px-4 pb-4 border-t border-white/5 pt-4 bg-black/20 text-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/60 mb-1">From: <span className="text-white/90">{msg.email || 'No email provided'}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" variant="outline" 
                      className="h-8 border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={(e) => { e.stopPropagation(); updateMessage.mutate({ id: msg.id, read: !msg.read }); }}
                    >
                      <MailCheck className="w-4 h-4 mr-2" />
                      {msg.read ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                    <Button 
                      size="sm" variant="destructive" 
                      className="h-8"
                      onClick={(e) => { e.stopPropagation(); deleteMessage.mutate(msg.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-white/80 whitespace-pre-wrap leading-relaxed p-4 bg-white/5 rounded-lg border border-white/5">
                  {msg.message}
                </div>
              </div>
            )}
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="text-center text-white/40 py-8">Inbox is empty</p>
        )}
      </div>
    </div>
  );
}

function StatsSection() {
  const { data: posts } = usePosts();
  const { data: messages } = useMessages();

  const totalPosts = posts?.length || 0;
  const pinnedPosts = posts?.filter(p => p.pinned).length || 0;
  const totalComments = posts?.reduce((acc, p) => acc + (p.comments_count || 0), 0) || 0;
  const unreadMessages = messages?.filter(m => !m.read).length || 0;

  const statCards = [
    { label: 'Total Posts', value: totalPosts, icon: ImageIcon },
    { label: 'Total Comments', value: totalComments, icon: MessageSquare },
    { label: 'Unread Messages', value: unreadMessages, icon: MailCheck },
    { label: 'Pinned Works', value: pinnedPosts, icon: Pin },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border-white/5 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-serif text-white mb-1">{stat.value}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-mono">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation('/admin');
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row selection:bg-primary/30">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 glass-panel md:min-h-screen relative z-10 flex flex-col">
          <div className="p-6 pb-2">
            <h2 className="font-serif text-2xl text-white tracking-wide">Studio</h2>
            <p className="text-primary text-xs font-mono tracking-widest mt-1">DASHBOARD</p>
          </div>
          
          <div className="p-4 flex-1">
            <Tabs defaultValue="stats" className="w-full" orientation="vertical">
              <TabsList className="flex md:flex-col h-auto bg-transparent gap-2 w-full justify-start overflow-x-auto md:overflow-x-visible">
                <TabsTrigger value="stats" className="justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary w-full text-white/60">
                  <BarChart className="w-4 h-4" /> <span className="hidden md:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary w-full text-white/60">
                  <User className="w-4 h-4" /> <span className="hidden md:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="posts" className="justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary w-full text-white/60">
                  <ImageIcon className="w-4 h-4" /> <span className="hidden md:inline">Posts</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary w-full text-white/60">
                  <MessageSquare className="w-4 h-4" /> <span className="hidden md:inline">Messages</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Desktop signout */}
              <div className="mt-8 hidden md:block border-t border-white/10 pt-4">
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
                <Button variant="ghost" onClick={() => window.open('/', '_blank')} className="w-full justify-start gap-3 mt-2 text-white/60 hover:text-white">
                  <Eye className="w-4 h-4" /> View Site
                </Button>
              </div>

              {/* Mobile signout embedded in list */}
              <div className="md:hidden flex gap-2 mt-4 ml-1">
                 <Button size="icon" variant="ghost" onClick={handleSignOut} className="text-red-400 hover:bg-red-400/10 shrink-0">
                  <LogOut className="w-4 h-4" />
                </Button>
                 <Button size="icon" variant="ghost" onClick={() => window.open('/', '_blank')} className="text-white/60 hover:text-white shrink-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Render content in a separate area, wait, Radix Tabs requires TabsContent adjacent to TabsList unless we use a provider approach.
                  Since we used <Tabs> wrapper, we must place TabsContent inside it. We will position them absolutely or rely on flex layout. */}
              
              <div className="md:fixed md:top-0 md:left-64 md:right-0 md:bottom-0 md:overflow-y-auto p-4 md:p-10 z-0">
                <div className="max-w-4xl mx-auto mt-4 md:mt-0 pb-20 md:pb-0">
                  <TabsContent value="stats" className="m-0 focus-visible:outline-none">
                    <StatsSection />
                  </TabsContent>
                  <TabsContent value="profile" className="m-0 focus-visible:outline-none">
                    <ProfileSection />
                  </TabsContent>
                  <TabsContent value="posts" className="m-0 focus-visible:outline-none">
                    <PostsSection />
                  </TabsContent>
                  <TabsContent value="messages" className="m-0 focus-visible:outline-none">
                    <MessagesSection />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>

      </div>
    </AdminGuard>
  );
}
