"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup } from "react-icons/hi";

const Modal = dynamic(() => import("@/components/admin/Modal"), { ssr: false });
const ImageUpload = dynamic(() => import("@/components/admin/ImageUpload"), { ssr: false });

export default function CollaboratorsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", title: "", affiliation: "", address: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    try {
      const { data, error } = await supabase
        .from("collaborators")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      toast.error(e?.message || "Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", title: "", affiliation: "", address: "", image_url: "" });
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name,
      title: row.title || "",
      affiliation: row.affiliation || "",
      address: row.address || "",
      image_url: row.image_url || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ name: "", title: "", affiliation: "", address: "", image_url: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim() || "",
        affiliation: form.affiliation.trim() || "",
        address: form.address.trim() || "",
        image_url: form.image_url || null,
      };
      if (editing) {
        const { error } = await supabase.from("collaborators").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Collaborator updated");
      } else {
        const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order), -1) + 1 : 0;
        const { error } = await supabase.from("collaborators").insert([{ ...payload, sort_order: nextOrder }]);
        if (error) throw error;
        toast.success("Collaborator added");
      }
      closeModal();
      fetchRows();
    } catch (err) {
      toast.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this collaborator?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("collaborators").delete().eq("id", id);
      if (error) throw error;
      toast.success("Removed");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Failed to remove");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Collaborators</h2>
          <p className="text-sm text-gray-500 mt-1">Shown on the public team page (real-time updates).</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl shadow-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add collaborator
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <HiOutlineUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No collaborators yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {row.image_url ? (
                    <Image
                      src={optimizeCloudinaryUrl(row.image_url)}
                      alt={row.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600 font-bold">
                      {row.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{row.name}</h3>
                  {row.title ? <p className="text-xs text-forest-700 font-medium mt-0.5 line-clamp-1">{row.title}</p> : null}
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 whitespace-pre-line">{row.affiliation}</p>
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-forest-600"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={deleting === row.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  {deleting === row.id ? (
                    <span className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <HiOutlineTrash className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? "Edit collaborator" : "Add collaborator"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title / role</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              placeholder="e.g. Professor of Ecology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization</label>
            <textarea
              value={form.affiliation}
              onChange={(e) => setForm((p) => ({ ...p, affiliation: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-y min-h-[4.5rem]"
              placeholder="Department, institute, division (line breaks allowed)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-y min-h-[5rem]"
              placeholder="Postal address (line breaks allowed)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo (optional)</label>
            <ImageUpload currentUrl={form.image_url} onUpload={(url) => setForm((p) => ({ ...p, image_url: url }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm text-gray-600 rounded-xl hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-forest-600 text-white text-sm font-medium rounded-xl disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
