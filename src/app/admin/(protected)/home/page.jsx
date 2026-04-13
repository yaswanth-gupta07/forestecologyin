"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import toast from "react-hot-toast";
import {
  HiOutlinePhotograph,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi";
import {
  SITE_SETTING_DEFAULTS,
  SITE_SETTING_KEYS,
} from "@/lib/siteSettingKeys";

const Modal = dynamic(() => import("@/components/admin/Modal"), { ssr: false });
const ImageUpload = dynamic(() => import("@/components/admin/ImageUpload"), { ssr: false });

export default function HomeContentPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    home_about_title: SITE_SETTING_DEFAULTS.home_about_title,
    home_about_body: SITE_SETTING_DEFAULTS.home_about_body,
    research_intro: SITE_SETTING_DEFAULTS.research_intro,
    contact_email: SITE_SETTING_DEFAULTS.contact_email,
    contact_phone: SITE_SETTING_DEFAULTS.contact_phone,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
    fetchSettings();

    const ch = supabase
      .channel("admin-hero")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, () => {
        fetchSlides();
      })
      .subscribe();

    return () => {
      cleanupChannel(ch);
    };
  }, []);

  async function fetchSlides() {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettings() {
    try {
      const { data } = await supabase.from("site_settings").select("key, value").in("key", SITE_SETTING_KEYS);
      const map = { ...SITE_SETTING_DEFAULTS };
      for (const row of data || []) {
        if (row.key in map) map[row.key] = row.value;
      }
      setSettings(map);
    } catch {
      /* ignore */
    }
  }

  async function persistSettings() {
    setSettingsSaving(true);
    try {
      const rows = SITE_SETTING_KEYS.map((key) => ({
        key,
        value: settings[key] ?? "",
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast.success("Site copy saved");
    } catch (e) {
      toast.error(e?.message || "Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  }

  function openAdd() {
    setFormUrl("");
    setModalOpen(true);
  }

  async function handleAddSlide(e) {
    e.preventDefault();
    if (!formUrl.trim()) {
      toast.error("Upload or provide an image URL");
      return;
    }
    setSaving(true);
    try {
      const nextOrder = slides.length ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("hero_slides")
        .insert([{ image_url: formUrl.trim(), sort_order: nextOrder }]);
      if (error) throw error;
      toast.success("Slide added");
      setModalOpen(false);
      setFormUrl("");
      fetchSlides();
    } catch (err) {
      toast.error(err?.message || "Failed to add slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this slide from the home carousel?")) return;
    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
      toast.success("Slide removed");
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to remove slide");
    }
  }

  async function moveSlide(id, dir) {
    const idx = slides.findIndex((s) => s.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= slides.length) return;
    const a = slides[idx];
    const b = slides[swapIdx];
    try {
      const { error: e1 } = await supabase.from("hero_slides").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("hero_slides").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2) throw e2;
      fetchSlides();
    } catch {
      toast.error("Could not reorder");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Home page</h2>
        <p className="text-sm text-gray-500 mt-1">
          Hero carousel images and text that appears on the public site (updates in real time).
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiOutlinePhotograph className="w-5 h-5 text-forest-600" />
            <h3 className="font-semibold text-gray-800">Hero images</h3>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add slide
          </button>
        </div>
        <p className="text-xs text-gray-500">
          If no slides are added, the site uses the built-in default images. Order is top to first in carousel.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : slides.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No custom slides — defaults show on the website.
          </p>
        ) : (
          <ul className="space-y-3">
            {slides.map((s, i) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/80"
              >
                <Image src={optimizeCloudinaryUrl(s.image_url)} alt="" width={96} height={64} className="h-16 w-24 object-cover rounded-lg border border-gray-200" />
                <p className="flex-1 text-xs text-gray-500 truncate min-w-[120px]">{s.image_url}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => moveSlide(s.id, "up")}
                    className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
                  >
                    <HiOutlineArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === slides.length - 1}
                    onClick={() => moveSlide(s.id, "down")}
                    className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50"
                  >
                    <HiOutlineArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-red-500 hover:bg-red-50"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Site copy</h3>
        <p className="text-xs text-gray-500">
          About (home), research intro, and contact details on the contact page.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">About heading</label>
            <input
              type="text"
              value={settings.home_about_title}
              onChange={(e) => setSettings((p) => ({ ...p, home_about_title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">About body</label>
            <textarea
              value={settings.home_about_body}
              onChange={(e) => setSettings((p) => ({ ...p, home_about_body: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Research areas intro</label>
            <textarea
              value={settings.research_intro}
              onChange={(e) => setSettings((p) => ({ ...p, research_intro: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact email (display)</label>
            <input
              type="text"
              value={settings.contact_email}
              onChange={(e) => setSettings((p) => ({ ...p, contact_email: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact phone (display)</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings((p) => ({ ...p, contact_phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={settingsSaving}
            onClick={persistSettings}
            className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl disabled:opacity-50"
          >
            {settingsSaving ? "Saving…" : "Save site copy"}
          </button>
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add hero slide">
        <form onSubmit={handleAddSlide} className="space-y-4">
          <ImageUpload currentUrl={formUrl} onUpload={setFormUrl} />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add slide"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
