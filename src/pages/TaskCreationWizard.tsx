
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TaskCreationWizard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = "Task title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Please select a category";
    if (!price || isNaN(Number(price))) newErrors.price = "Valid price is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({ title: "Please log in to post a task", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("Tasks").insert([
        {
          title: title.trim(),
          description: description.trim(),
          category,
          price: price,
          deadline: deadline || null,
          location: location.trim() || null,
          user_id: user.id,
          status: "open",
          type: "standard"
        }
      ]);

      if (error) throw error;

      toast({ title: "Task posted successfully!" });
      navigate("/");
    } catch (error: any) {
      toast({ 
        title: "Failed to post task", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h1 className="text-xl font-bold mb-4">Post a New Task</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Fill out the details below to get help with your task
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">Task Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full px-4 py-2 border rounded-md text-sm mt-1"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your task..."
              rows={4}
              className="w-full px-4 py-2 border rounded-md text-sm mt-1 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm mt-1"
            >
              <option value="">Select a category</option>
              <option value="cleaning">Cleaning</option>
              <option value="handyman">Handyman</option>
              <option value="delivery">Delivery</option>
              <option value="tutoring">Tutoring</option>
              <option value="gardening">Gardening</option>
              <option value="tech">Tech Support</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Budget (€)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-md text-sm mt-1"
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Deadline (Optional)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Location (Optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or address"
              className="w-full px-4 py-2 border rounded-md text-sm mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="min-w-[120px] border rounded-md px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px] bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              {loading ? "Posting..." : "Post Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
