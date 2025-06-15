
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { value: "Cleaning", label: "Cleaning" },
  { value: "Delivery", label: "Delivery" },
  { value: "Repairs", label: "Repairs" },
  { value: "Pet Care", label: "Pet Care" },
  { value: "Tech Help", label: "Tech Help" },
  { value: "Moving", label: "Moving" },
  { value: "Other", label: "Other" },
];

const BOOST_OPTIONS = [
  { value: "none", label: "No Boost (Free)" },
  { value: "8h", label: "Boost for 8 hours (€1)" },
  { value: "24h", label: "Boost for 24 hours (€2.5)" },
];

export default function TaskCreationWizard({ onDone }: { onDone?: () => void }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    budget: "",
    boost: "none",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [posting, setPosting] = useState(false);

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" })); // Clear error on change
  }

  function validate() {
    const errs: { [k: string]: string } = {};
    if (!form.title.trim()) errs.title = "Task title is required";
    if (!form.category) errs.category = "Task category is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.budget || isNaN(Number(form.budget))) errs.budget = "Budget is required and must be a number";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast({ title: "Please fix errors", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      // Get logged in user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare Supabase payload
      const payload = {
        user_id: user.id,
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location || null,
        budget: Number(form.budget),
        boost: form.boost,
        status: "open",
      };
      const { error } = await supabase.from("Tasks").insert([payload]);
      if (error) throw error;
      toast({ title: "Task posted!", description: "Your task is now live." });
      if (onDone) onDone();
      // Optionally clear form here (not required)
    } catch (e: any) {
      toast({ title: "Failed to post", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto bg-white border rounded-xl shadow-md p-6 flex flex-col gap-5">
      <h2 className="text-xl font-bold text-primary text-center mb-2">
        Post a New Task
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Task Title */}
        <div>
          <label className="block font-medium mb-1">Task Title <span className="text-destructive">*</span></label>
          <Input
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            placeholder="Briefly describe your task"
            disabled={posting}
          />
          {errors.title && <div className="text-destructive text-sm">{errors.title}</div>}
        </div>
        
        {/* Task Category */}
        <div>
          <label className="block font-medium mb-1">Task Category <span className="text-destructive">*</span></label>
          <Select value={form.category} onValueChange={val => handleChange("category", val)} disabled={posting}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <div className="text-destructive text-sm">{errors.category}</div>}
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Task Description <span className="text-destructive">*</span></label>
          <Textarea
            value={form.description}
            onChange={e => handleChange("description", e.target.value)}
            placeholder="Provide more details about the task, expectations, and timing"
            rows={4}
            disabled={posting}
          />
          {errors.description && <div className="text-destructive text-sm">{errors.description}</div>}
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium mb-1">Location</label>
          <Input
            value={form.location}
            onChange={e => handleChange("location", e.target.value)}
            placeholder="Where is the task located?"
            disabled={posting}
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block font-medium mb-1">Budget (€) <span className="text-destructive">*</span></label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={form.budget}
            onChange={e => handleChange("budget", e.target.value)}
            placeholder="e.g. 25"
            disabled={posting}
          />
          {errors.budget && <div className="text-destructive text-sm">{errors.budget}</div>}
        </div>

        {/* Boost Visibility */}
        <div>
          <label className="block font-medium mb-1">Boost Visibility</label>
          <RadioGroup
            value={form.boost}
            onValueChange={val => handleChange("boost", val)}
            className="flex flex-col gap-2 sm:flex-row items-start sm:items-center"
            disabled={posting}
          >
            {BOOST_OPTIONS.map(opt => (
              <div key={opt.value} className="flex items-center gap-1">
                <RadioGroupItem value={opt.value} id={opt.value} />
                <label htmlFor={opt.value} className="text-sm ml-1">{opt.label}</label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Submit */}
        <Button type="submit" className="mt-4" disabled={posting}>
          {posting ? "Posting..." : "Post Task"}
        </Button>
      </form>
    </div>
  );
}
