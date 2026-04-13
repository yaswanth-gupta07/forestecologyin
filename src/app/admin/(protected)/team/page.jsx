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
  HiOutlineUserGroup,
} from "react-icons/hi";

const Modal = dynamic(() => import("@/components/admin/Modal"), { ssr: false });
const ImageUpload = dynamic(() => import("@/components/admin/ImageUpload"), { ssr: false });

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    tagline: "",
    bio: "",
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel("admin-team-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "team" }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Team fetch error:", err);
      toast.error(err?.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", role: "", tagline: "", bio: "", image_url: "" });
    setModalOpen(true);
  }

  function openEdit(member) {
    setEditing(member);
    const legacyBio =
      (member.bio && member.bio.trim()) ||
      (member.description && member.description.trim()) ||
      "";
    setForm({
      name: member.name,
      role: member.role,
      tagline: member.tagline || "",
      bio: legacyBio,
      image_url: member.image_url || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", role: "", tagline: "", bio: "", image_url: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Name and role are required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        tagline: form.tagline.trim() || null,
        bio: form.bio.trim() || null,
        description: null,
        image_url: form.image_url || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("team")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;
        toast.success("Team member updated");
      } else {
        const { error } = await supabase.from("team").insert([payload]);

        if (error) throw error;
        toast.success("Team member added");
      }

      closeModal();
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this team member?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("team").delete().eq("id", id);
      if (error) throw error;
      toast.success("Team member removed");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tagline (highlight line) and bio (full profile; use blank lines between paragraphs).
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700
            text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {member.image_url ? (
                    <Image
                      src={optimizeCloudinaryUrl(member.image_url)}
                      alt={member.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-forest-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-forest-600">
                        {member.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-forest-600 mt-0.5">
                    {member.role}
                  </p>
                  {(member.tagline || member.description) && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {member.tagline || member.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-gray-100
                opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(member)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest-600 transition-colors"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={deleting === member.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors
                    disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === member.id ? (
                    <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <HiOutlineTrash className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500">
            No team members yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Click &quot;Add Member&quot; to add your first team member
          </p>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Team Member" : "Add Team Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Research Lead, PhD Scholar"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Short highlighted line under the role"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Full profile. Separate paragraphs with a blank line."
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                transition-all placeholder-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Photo (optional)
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
              {saving ? "Saving..." : editing ? "Update" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
