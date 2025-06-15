
import React, { useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";

export default function WizardStepDescription({
  value,
  images,
  onChange,
  onImages
}: { value: string, images: File[], onChange: (text: string) => void, onImages: (imgs: File[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    onImages(files);
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold flex items-center gap-2"><ImagePlus className="text-gray-500" /> Describe your task</label>
      <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder="Describe the task in detail..." rows={4} />
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm"><ImagePlus /> Attach images (optional)</label>
        <input type="file" multiple ref={fileRef} onChange={handleFile} className="border px-2 py-1 rounded w-full" accept="image/*" />
        {images && images.length > 0 &&
          <div className="flex flex-wrap gap-2 mt-2">{images.map((img, i) => <span className="bg-gray-100 rounded px-2 py-1 text-xs" key={i}>{img.name}</span>)}</div>
        }
      </div>
    </div>
  );
}
