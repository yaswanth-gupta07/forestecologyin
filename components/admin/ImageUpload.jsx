"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { HiOutlineCloudUpload, HiOutlineX } from "react-icons/hi";
import { uploadImage } from "@/lib/cloudinary";
import toast from "react-hot-toast";

export default function ImageUpload({ onUpload, currentUrl, className = "" }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const url = await uploadImage(file);
      onUpload(url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Upload failed");
      setPreview(currentUrl || null);
      onUpload(currentUrl || "");
    }

    setUploading(false);
  }

  function handleChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function clearImage() {
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={className}>
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <Image src={preview} alt="Preview" width={800} height={384} className="w-full h-48 object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
            cursor-pointer transition-all duration-150
            ${
              dragOver
                ? "border-forest-500 bg-forest-50"
                : "border-gray-300 hover:border-forest-400 hover:bg-gray-50"
            }
          `}
        >
          <HiOutlineCloudUpload className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            Drop an image here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
