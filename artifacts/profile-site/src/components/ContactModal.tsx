import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMessage } from '../hooks/useMessages';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60).trim(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  message: z.string().min(1, 'Message is required').max(1000).trim(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ isOpen, onOpenChange }: ContactModalProps) {
  const createMessage = useCreateMessage();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' }
  });

  const onSubmit = (data: ContactFormValues) => {
    createMessage.mutate({ ...data, email: data.email ?? null }, {
      onSuccess: () => {
        toast.success('Message sent successfully!');
        form.reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to send message');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-white/10 text-white bg-background/80">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Get in touch</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Send a direct message. I'll get back to you as soon as I can.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" className="bg-white/5 border-white/10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" className="bg-white/5 border-white/10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's on your mind?" 
                      className="resize-none min-h-[120px] bg-white/5 border-white/10" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              disabled={createMessage.isPending}
            >
              {createMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Message
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
