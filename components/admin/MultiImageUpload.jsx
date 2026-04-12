"use client";

import ImageUpload from "@/components/admin/ImageUpload";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";

export default function MultiImageUpload({ urls, onChange, label = "Images" }) {
  const list = urls && urls.length > 0 ? urls : [""];

  function setAt(i, url) {
    const next = [...list];
    next[i] = url;
    onChange(next);
  }

  function add() {
    onChange([...list, ""]);
  }

  function remove(i) {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length > 0 ? next : [""]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add image
        </button>
      </div>
      <p className="text-xs text-gray-500">
        First image is used on the card; all images appear in the detail view.
      </p>
      {list.map((url, i) => (
        <div key={i} className="relative rounded-xl border border-gray-100 p-3 bg-gray-50/80">
          {list.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white border border-gray-200 text-red-500 hover:bg-red-50"
              title="Remove slot"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
          <ImageUpload currentUrl={url || ""} onUpload={(u) => setAt(i, u)} />
        </div>
      ))}
    </div>
  );
}
