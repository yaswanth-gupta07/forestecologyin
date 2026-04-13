"use client";

import { useState, useEffect } from "react";
import { cleanupChannel, supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineRefresh } from "react-icons/hi";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);

      const unread = (data || []).filter((m) => !m.read).map((m) => m.id);
      if (unread.length) {
        await supabase.from("contact_messages").update({ read: true }).in("id", unread);
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      }
    } catch (e) {
      toast.error(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("contact-messages-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, () => {
        fetchMessages();
        toast.success("New contact message");
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contact messages</h2>
          <p className="text-sm text-gray-500 mt-1">Submissions from the public contact form (live updates).</p>
        </div>
        <button
          type="button"
          onClick={fetchMessages}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <HiOutlineMail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-sm text-forest-600 hover:underline">
                    {m.email}
                  </a>
                </div>
                <time className="text-xs text-gray-400">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : ""}
                </time>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">{m.subject}</p>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
