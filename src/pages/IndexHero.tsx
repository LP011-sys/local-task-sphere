
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function IndexHero({ authed }: { authed: boolean }) {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-10 p-8 max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 max-w-xl md:text-left text-center items-start md:items-start">
        <h1 className="text-5xl font-extrabold text-primary drop-shadow mb-3">Find the right person for your task, fast.</h1>
        <p className="text-lg text-muted-foreground mb-3">
          Welcome to <span className="font-semibold text-accent-foreground">Task Hub</span>, your place to post tasks or offer services.<br />
          Instantly find help, make offers, and collaborate in your local area.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-3">
          <a href="/post-task"><Button size="lg" className="text-base">Post a Task</Button></a>
          <a href="#tasks"><Button variant="outline" size="lg" className="text-base">Browse Tasks</Button></a>
          {authed && (<a href="/dashboard"><Button variant="secondary" size="lg" className="text-base">View My Dashboard</Button></a>)}
        </div>
      </div>
      <img
        src="/placeholder.svg"
        alt="Task hub art"
        className="w-80 h-48 object-contain drop-shadow-xl mt-6 md:mt-0"
        draggable={false}
      />
    </section>
  );
}
