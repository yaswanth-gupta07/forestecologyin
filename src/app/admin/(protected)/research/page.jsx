"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBeaker,
} from "react-icons/hi";

const Modal = dynamic(() => import("@/components/admin/Modal"), { ssr: false });
const MultiImageUpload = dynamic(() => import("@/components/admin/MultiImageUpload"), { ssr: false });

function rowToImageSlots(row) {
  const u = [];
  if (row.image_url) u.push(row.image_url);
  if (Array.isArray(row.image_urls)) {
    for (const x of row.image_urls) {
      if (x && !u.includes(x)) u.push(x);
    }
  }
  return u.length ? u : [""];
}

function slotsToPayload(imageSlots) {
  const cleaned = imageSlots.map((s) => String(s).trim()).filter(Boolean);
  return {
    image_url: cleaned[0] || null,
    image_urls: cleaned.length > 1 ? cleaned : null,
  };
}

export default function ResearchPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageSlots: [""],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("admin-research-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "research" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("research")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch {
      toast.error("Failed to load research posts");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: "", description: "", imageSlots: [""] });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      imageSlots: rowToImageSlots(item),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ title: "", description: "", imageSlots: [""] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);

    try {
      const { image_url, image_urls } = slotsToPayload(form.imageSlots);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        image_url,
        image_urls,
      };

      if (editing) {
        const { error } = await supabase
          .from("research")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;
        toast.success("Research post updated");
      } else {
        const { error } = await supabase.from("research").insert([payload]);

        if (error) throw error;
        toast.success("Research post added");
      }

      closeModal();
      fetchPosts();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this research post?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("research").delete().eq("id", id);
      if (error) throw error;
      toast.success("Research post deleted");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Research</h2>
          <p className="text-sm text-gray-500 mt-1">
            Research areas (multiple images per area supported; live on the public site).
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700
            text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const imgs = rowToImageSlots(post).filter((s) => s && String(s).trim());
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {imgs[0] && (
                    <Image
                      src={optimizeCloudinaryUrl(imgs[0])}
                      alt={post.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-lg object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-800 truncate">
                          {post.title}
                        </h3>
                        {post.created_at && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        {imgs.length > 1 && (
                          <p className="text-xs text-forest-600 mt-1">{imgs.length} images</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(post)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest-600 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors
                          disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === post.id ? (
                            <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin block" />
                          ) : (
                            <HiOutlineTrash className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <HiOutlineBeaker className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500">
            No research posts yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Click &quot;Add Post&quot; to create your first research entry
          </p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Research Post" : "Add Research Post"}
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
              placeholder="Research title"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the research..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400 resize-none"
              required
            />
          </div>

          <MultiImageUpload
            urls={form.imageSlots}
            onChange={(slots) => setForm({ ...form, imageSlots: slots })}
            label="Images"
          />

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
              {saving ? "Saving..." : editing ? "Update" : "Add Post"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
