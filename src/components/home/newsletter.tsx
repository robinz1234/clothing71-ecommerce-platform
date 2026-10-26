"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Client-only feedback for Milestone 1 (no backend integration yet)
    setSubscribed(true);
  };

  return (
    <section className="w-full border-b border-border bg-muted/40 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            VIP Drop Access
          </span>
          <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            JOIN THE ATTITUDE
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Subscribe for early drop access, private warehouse releases, and new arrival alerts straight from our Dhaka factory.
          </p>

          {subscribed ? (
            <div className="mt-8 flex items-center justify-center gap-2 border border-border bg-background p-4 text-xs font-bold uppercase tracking-widest text-foreground">
              <Check className="size-4 text-black dark:text-white" />
              <span>THANK YOU FOR SUBSCRIBING. WELCOME TO CLOTHING71.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                className="h-12 flex-1 border border-border bg-background px-4 text-xs font-medium tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 text-xs font-bold tracking-[0.2em]"
              >
                <span>SUBSCRIBE</span>
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          )}

          <p className="mt-4 text-[10px] tracking-wider uppercase text-muted-foreground">
            By subscribing, you agree to receive communications from Clothing71. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
