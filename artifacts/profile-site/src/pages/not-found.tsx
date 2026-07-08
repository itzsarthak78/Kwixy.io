import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      {/* Cinematic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="text-center relative z-10 glass-panel p-12 rounded-3xl border-white/5">
        <h1 className="font-serif text-8xl md:text-9xl font-bold text-white mb-4 text-glow">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-mono tracking-widest text-primary mb-6">
          PAGE NOT FOUND
        </h2>
        <p className="max-w-md mx-auto text-white/60 mb-10 text-sm md:text-base">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 shadow-[0_0_20px_rgba(108,99,255,0.3)]">
            Return to Studio
          </Button>
        </Link>
      </div>
    </div>
  );
}
