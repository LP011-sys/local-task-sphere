
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Rocket } from "lucide-react";

const BOOST_OPTIONS = [
  { value: "none", label: "No Boost (Free)", price: 0, duration: 0 },
  { value: "8h", label: "8-hour boost", price: 1, duration: 8 },
  { value: "24h", label: "24-hour boost", price: 2.5, duration: 24 },
];

export default function TaskCreationWizard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [boostOption, setBoostOption] = useState("none");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedBoost = BOOST_OPTIONS.find(opt => opt.value === boostOption);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = "Task title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Please select a category";
    if (!price || isNaN(Number(price))) newErrors.price = "Valid price is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBoostPayment = async () => {
    if (!selectedBoost || selectedBoost.price === 0) return true;

    try {
      // Call Stripe payment for boost - this is a simplified implementation
      // In a real app, you'd integrate with Stripe Checkout or Elements
      const { data, error } = await supabase.functions.invoke("create-boost-payment", {
        body: {
          amount: selectedBoost.price * 100, // Convert to cents
          description: `Task boost - ${selectedBoost.label}`,
        },
      });

      if (error) throw error;
      
      // For demo purposes, we'll assume payment succeeded
      return true;
    } catch (error: any) {
      toast({ 
        title: "Payment failed", 
        description: error.message,
        variant: "destructive" 
      });
      return false;
    }
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

      // Handle boost payment if selected
      if (selectedBoost && selectedBoost.price > 0) {
        const paymentSuccess = await handleBoostPayment();
        if (!paymentSuccess) {
          setLoading(false);
          return;
        }
      }

      const boostExpiresAt = selectedBoost && selectedBoost.duration > 0 
        ? new Date(Date.now() + selectedBoost.duration * 60 * 60 * 1000).toISOString()
        : null;

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
          type: "standard",
          is_boosted: selectedBoost ? selectedBoost.duration > 0 : false,
          boost_duration: selectedBoost ? selectedBoost.duration : 0,
          boost_amount: selectedBoost ? selectedBoost.price : 0,
          boost_expires_at: boostExpiresAt,
        }
      ]);

      if (error) throw error;

      const boostMessage = selectedBoost && selectedBoost.price > 0 
        ? ` Your task has been boosted for ${selectedBoost.duration} hours!`
        : "";

      toast({ title: `Task posted successfully!${boostMessage}` });
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

          {/* Boost Options */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-5 h-5 text-blue-600" />
              <Label className="text-base font-semibold text-blue-900">Boost Your Task</Label>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Get more visibility and faster responses by boosting your task to the top of the feed!
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BOOST_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    boostOption === option.value
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                  onClick={() => setBoostOption(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="boost"
                      value={option.value}
                      checked={boostOption === option.value}
                      onChange={() => setBoostOption(option.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-gray-600">
                        {option.price === 0 ? "Free" : `€${option.price}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedBoost && selectedBoost.price > 0 && (
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                <Rocket className="inline w-4 h-4 mr-1" />
                Your task will be boosted for {selectedBoost.duration} hours for €{selectedBoost.price}
              </div>
            )}
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
              {loading ? "Posting..." : selectedBoost && selectedBoost.price > 0 ? `Post & Pay €${selectedBoost.price}` : "Post Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
