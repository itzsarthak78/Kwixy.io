import React, { useState, useEffect } from 'react';
import { useComments, useCreateComment } from '../hooks/useComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';

const commentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60).trim(),
  content: z.string().min(1, 'Comment cannot be empty').max(500).trim(),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  
  const [cooldown, setCooldown] = useState(0);
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { name: '', content: '' }
  });

  useEffect(() => {
    const lastSubmitTime = localStorage.getItem(`comment_rate_limit_${postId}`);
    if (lastSubmitTime) {
      const elapsed = (Date.now() - parseInt(lastSubmitTime)) / 1000;
      if (elapsed < 30) {
        setCooldown(Math.ceil(30 - elapsed));
      }
    }
  }, [postId]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = (data: CommentFormValues) => {
    createComment.mutate(
      { post_id: postId, ...data },
      {
        onSuccess: () => {
          form.reset({ name: data.name, content: '' }); // keep name
          localStorage.setItem(`comment_rate_limit_${postId}`, Date.now().toString());
          setCooldown(30);
          toast.success('Comment posted');
        },
        onError: (err: any) => toast.error(err.message || 'Failed to post comment')
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50 border-l border-white/5 rounded-r-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h3 className="font-serif text-lg text-white">Comments ({comments?.length || 0})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm italic">
            No comments yet. Be the first to share your thoughts.
          </div>
        ) : (
          <AnimatePresence>
            {comments?.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-medium text-white/90 text-sm">{comment.name}</span>
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed break-words">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-white/5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Name" 
                      className="bg-white/5 border-white/10 h-8 text-sm placeholder:text-white/30" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Add a comment..." 
                        className="bg-white/5 border-white/10 min-h-[80px] text-sm resize-none pr-10 placeholder:text-white/30" 
                        {...field} 
                      />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/80 text-white"
                        disabled={createComment.isPending || cooldown > 0}
                      >
                        {createComment.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : cooldown > 0 ? (
                          <span className="text-[10px] font-bold">{cooldown}s</span>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
