
import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Coins, Handshake, Camera, MapPin, ArrowRight, CalendarClock, DollarSign, Repeat, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

// Static categories and price suggestions
const CATEGORIES = [
  "Furniture Assembly",
  "Cleaning",
  "Errands",
  "Admin Help",
  "Pet Care"
];
const SUGGESTED_PRICES: Record<string, string> = {
  "Furniture Assembly": "€20–€40",
  "Cleaning": "€15–€30",
  "Errands": "€8–€20",
  "Admin Help": "€12–€25",
  "Pet Care": "€10–€18"
};
const REPEAT_FREQ = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" }
];
const BOOST_OPTIONS = [
  { label: "None", value: "" },
  { label: "8 hours (€1)", value: "8h" },
  { label: "24 hours (€2.5)", value: "24h" }
];

type FormValues = {
  title: string;
  description: string;
  category: string;
  images: File[];
  location: any;
  deadline: string;
  offerDeadline: string;
  negotiable: boolean;
  price: string;
  offer: string;
  boost: string;
  repeat: boolean;
  repeatFrequency: string;
};

function getSuggestedPrice(category: string) {
  return SUGGESTED_PRICES[category] || "€15–€40";
}

export default function TaskCreationWizard() {
  const [mapAddress, setMapAddress] = useState("");
  const [mapLatLng, setMapLatLng] = useState<{lat: number, lng: number} | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      images: [],
      location: null,
      deadline: "",
      offerDeadline: "",
      negotiable: false,
      price: "",
      offer: "",
      boost: "",
      repeat: false,
      repeatFrequency: "weekly",
    }
  });
  const negotiable = watch("negotiable");
  const category = watch("category");
  const repeat = watch("repeat");
  const images = watch("images");

  // Images handler
  function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0,5);
    setValue("images", files as File[], { shouldValidate: true });
  }

  // Fake Google Maps integration
  function handleMapAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMapAddress(e.target.value);
    // Demo: fake lat/lng if address looks good
    setMapLatLng(e.target.value.length > 5 ? {lat: 59.33, lng: 18.06} : null);
    setValue("location", {
      address: e.target.value,
      lat: 59.33,
      lng: 18.06
    }, { shouldValidate: true });
  }

  // On submit: send to Supabase Tasks table
  async function onSubmit(data: FormValues) {
    setSubmitting(true);
    try {
      // Check required fields custom
      if (new Date(data.deadline).getTime() < Date.now() - 60000)
        throw new Error("Deadline can’t be before current time.");
      if (!data.negotiable && (!data.price || Number(data.price) <= 0))
        throw new Error("Please set your price.");
      // Find current user's app_users id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const { data: userRow, error: userErr } = await supabase
        .from("app_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!userRow || userErr) throw new Error("No user record.");
      // Prepare payload, skip image upload for now (only store names)
      const taskPayload = {
        user_id: userRow.id,
        title: data.title,
        description: data.description,
        category: data.category,
        images: (data.images && data.images.length > 0) ? data.images.map(f=>f.name) : null,
        location: data.location,
        deadline: data.deadline,
        acceptance_deadline: data.offerDeadline || null,
        type: data.negotiable ? "negotiable" : "fixed",
        price: data.negotiable ? null : data.price,
        offer: data.negotiable ? data.offer : null,
        recurring: !!data.repeat,
        boost_status: data.boost,
        suggested_price: getSuggestedPrice(data.category),
        repeat_frequency: data.repeat ? data.repeatFrequency : null,
      };
      const { error } = await supabase.from("Tasks").insert([taskPayload]);
      if (error) throw new Error(error.message);

      toast({
        title: "Task created successfully!",
        description: "Your task is now live and visible to providers."
      });
      navigate("/"); // dashboard, could be /my-tasks
    } catch (e: any) {
      toast({
        title: "Task not created",
        description: e.message || "An unknown error occurred.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto w-full pt-4 pb-12 px-2">
      <div className="rounded-xl bg-white shadow-md border px-4 py-5 flex flex-col gap-7">
        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-900"><ArrowRight />Post a New Task</h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>

          {/* 1. Title */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2">Task Title<span className="ml-1 text-red-500">*</span></label>
            <Input
              {...register("title", { required: "Title required", maxLength: 80 })}
              maxLength={80}
              placeholder="e.g., Assemble IKEA wardrobe"
            />
            <div className="text-xs text-muted-foreground">Max 80 characters</div>
            {errors.title && <div className="text-red-500 text-xs">{errors.title.message}</div>}
          </div>
          
          {/* 2. Description */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2">Task Description<span className="ml-1 text-red-500">*</span></label>
            <Textarea
              rows={4}
              {...register("description", { required: "Description required" })}
              placeholder="Describe your task in detail..."
            />
            <div className="text-xs text-muted-foreground">Include all relevant details like time needed, tools required, etc.</div>
            {errors.description && <div className="text-red-500 text-xs">{errors.description.message}</div>}
          </div>
          
          {/* 3. Category */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2">Task Category<span className="ml-1 text-red-500">*</span></label>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <div className="text-red-500 text-xs">{errors.category.message}</div>}
          </div>
          
          {/* 4. Images */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2"><Camera className="text-gray-500" /> Add Photos (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              max={5}
              ref={fileRef}
              onChange={onImages}
              className="mt-2 text-xs"
            />
            {images && images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">{images.map((img, i) => (
                <span className="bg-gray-100 rounded px-2 py-1 text-xs" key={i}>{img.name}</span>
              ))}</div>
            )}
            <div className="text-xs text-muted-foreground">Up to 5 images</div>
          </div>

          {/* 5. Location */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2"><MapPin className="text-gray-500" /> Task Location<span className="ml-1 text-red-500">*</span></label>
            <Input
              placeholder="Address or area"
              value={mapAddress}
              onChange={handleMapAddressChange}
            />
            <div className="h-32 bg-blue-50 mt-2 rounded-lg flex items-center justify-center border border-blue-100">
              {mapLatLng ? (
                <div>
                  <div className="text-xs text-blue-700 flex flex-col gap-1 items-center">
                    <span>Pin set <MapPin size={18} className="inline-block"/><br />
                      <span className="font-mono">({mapLatLng.lat}, {mapLatLng.lng})</span>
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-blue-300">[Map preview placeholder]</span>
              )}
            </div>
            {errors.location && <div className="text-red-500 text-xs mt-1">Location required</div>}
          </div>

          {/* 6. Deadline */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2"><Calendar className="text-gray-500" /> Deadline<span className="ml-1 text-red-500">*</span></label>
            <Input
              type="datetime-local"
              {...register("deadline", { required: "Deadline required" })}
              min={format(Date.now(), "yyyy-MM-dd'T'HH:mm")}
            />
            {errors.deadline && <div className="text-red-500 text-xs">{errors.deadline.message}</div>}
          </div>

          {/* 7. Offer Deadline */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2"><CalendarClock className="text-gray-500" /> Latest Offer Time</label>
            <Input
              type="datetime-local"
              {...register("offerDeadline")}
            />
            <div className="text-xs text-muted-foreground">Latest time a provider can accept this task</div>
          </div>

          {/* 8. Negotiable Toggle / Price */}
          <div>
            <label className="font-medium text-sm flex items-center gap-2"><DollarSign className="text-gray-500" /> Price Negotiable?</label>
            <div className="flex items-center gap-3">
              <Switch checked={negotiable} onCheckedChange={val => setValue("negotiable", val)} />
              <span>{negotiable ? "Yes" : "No"}</span>
            </div>
          </div>
          {!negotiable ? (
            <div>
              <label className="text-sm font-medium flex items-center gap-2">Set Your Price (Gross)<span className="ml-1 text-red-500">*</span></label>
              <Input
                type="number"
                min={0}
                {...register("price")}
                placeholder="e.g. 30"
              />
              {errors.price && <div className="text-red-500 text-xs">{errors.price.message}</div>}
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium flex items-center gap-2">Suggested Starting Price</label>
              <Input
                type="number"
                min={0}
                {...register("offer")}
                placeholder="e.g. 20"
              />
            </div>
          )}

          {/* 9. Price suggestion range */}
          {category && <div className="flex items-center gap-2">
            <Coins className="text-yellow-400" /> 
            <span className="text-sm text-yellow-800">Similar tasks typically cost <b>{getSuggestedPrice(category)}</b></span>
          </div>}

          {/* 10. Boost */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2"><Rocket className="text-gray-500" /> Boost Task Visibility</label>
            <Controller
              name="boost"
              control={control}
              render={({ field }) => (
                <div className="flex flex-row gap-3 mt-2">
                  {BOOST_OPTIONS.map(opt => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={field.value === opt.value ? "default" : "outline"}
                      onClick={() => field.onChange(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* 11. Repeat */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2"><Repeat className="text-gray-500" /> Repeat This Task?</label>
            <div className="flex items-center gap-3">
              <Switch checked={repeat} onCheckedChange={val => setValue("repeat", val)} />
              <span>{repeat ? "Yes" : "No"}</span>
            </div>
          </div>
          {repeat && (
            <div>
              <label className="text-sm font-medium flex items-center gap-2">Repeat Frequency</label>
              <Controller
                name="repeatFrequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPEAT_FREQ.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* 12. Submit */}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Submit Task"}
          </Button>
        </form>
      </div>
    </div>
  );
}
