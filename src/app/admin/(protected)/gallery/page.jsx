"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhotograph,
} from "react-icons/hi";

const Modal = dynamic(() => import("@/components/admin/Modal"), { ssr: false });
const ImageUpload = dynamic(() => import("@/components/admin/ImageUpload"), { ssr: false });

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: "", image_url: "" });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ title: item.title, image_url: item.image_url });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ title: "", image_url: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url) {
      toast.error("Please fill in all fields and upload an image");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        const { error } = await supabase
          .from("gallery")
          .update({ title: form.title.trim(), image_url: form.image_url })
          .eq("id", editing.id);

        if (error) throw error;
        toast.success("Image updated successfully");
      } else {
        const { error } = await supabase
          .from("gallery")
          .insert([{ title: form.title.trim(), image_url: form.image_url }]);

        if (error) throw error;
        toast.success("Image added successfully");
      }

      closeModal();
      fetchImages();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      toast.success("Image deleted");
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      toast.error("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your gallery images
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700
            text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={optimizeCloudinaryUrl(item.image_url)}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {item.title}
                  </h3>
                  {item.created_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest-600 transition-colors"
                    title="Edit"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors
                      disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === item.id ? (
                      <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <HiOutlineTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <HiOutlinePhotograph className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500">
            No images yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Click &quot;Add Image&quot; to upload your first gallery image
          </p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Image" : "Add Image"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter image title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image
            </label>
            <ImageUpload
              currentUrl={form.image_url}
              onUpload={(url) => setForm({ ...form, image_url: url })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800
                rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium
                rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : editing ? "Update" : "Add Image"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
