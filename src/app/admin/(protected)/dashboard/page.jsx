"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";
import {
  HiOutlinePhotograph,
  HiOutlineBeaker,
  HiOutlineUserGroup,
  HiOutlineUserAdd,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlineDocumentText,
} from "react-icons/hi";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    gallery: null,
    research: null,
    team: null,
    hero: null,
    collaborators: null,
    messages: null,
    unreadMessages: null,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const [
        galleryRes,
        researchRes,
        teamRes,
        heroRes,
        collabRes,
        msgRes,
        unreadRes,
      ] = await Promise.all([
        supabase.from("gallery").select("*", { count: "exact", head: true }),
        supabase.from("research").select("*", { count: "exact", head: true }),
        supabase.from("team").select("*", { count: "exact", head: true }),
        supabase.from("hero_slides").select("*", { count: "exact", head: true }),
        supabase.from("collaborators").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true })
          .eq("read", false),
      ]);

      setStats({
        gallery: galleryRes.count ?? 0,
        research: researchRes.count ?? 0,
        team: teamRes.count ?? 0,
        hero: heroRes.count ?? 0,
        collaborators: collabRes.count ?? 0,
        messages: msgRes.count ?? 0,
        unreadMessages: unreadRes.count ?? 0,
      });

      const { data: recentGallery } = await supabase
        .from("gallery")
        .select("id, title, image_url, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      setRecentItems(recentGallery || []);

      const { data: msgs } = await supabase
        .from("contact_messages")
        .select("id, name, email, subject, created_at, read")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentMessages(msgs || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();

    const ch = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "research" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "team" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborators" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      cleanupChannel(ch);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview updates live as the public site and forms change.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={HiOutlineDocumentText}
          label="Hero slides"
          count={stats.hero}
          color="forest"
        />
        <StatCard
          icon={HiOutlinePhotograph}
          label="Gallery Images"
          count={stats.gallery}
          color="forest"
        />
        <StatCard
          icon={HiOutlineBeaker}
          label="Research Posts"
          count={stats.research}
          color="blue"
        />
        <StatCard
          icon={HiOutlineUserGroup}
          label="Team Members"
          count={stats.team}
          color="amber"
        />
        <StatCard
          icon={HiOutlineUserAdd}
          label="Collaborators"
          count={stats.collaborators}
          color="amber"
        />
        <StatCard
          icon={HiOutlineMail}
          label="Contact messages"
          count={stats.messages}
          color="blue"
        />
      </div>

      {stats.unreadMessages > 0 && (
        <p className="text-sm text-forest-700 bg-forest-50 border border-forest-100 rounded-xl px-4 py-3">
          {stats.unreadMessages} unread message{stats.unreadMessages === 1 ? "" : "s"}.{" "}
          <Link href="/admin/messages" className="font-medium underline">
            Open messages
          </Link>
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <HiOutlineClock className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-800">Recent Gallery Uploads</h3>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-lg shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <Image
                    src={optimizeCloudinaryUrl(item.image_url)}
                    alt={item.title}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover border border-gray-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <HiOutlinePhotograph className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No gallery images yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <HiOutlineMail className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">Recent contact messages</h3>
            </div>
            <Link href="/admin/messages" className="text-xs font-medium text-forest-600 hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ) : recentMessages.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {recentMessages.map((m) => (
                <li key={m.id} className="px-6 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <HiOutlineMail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No messages yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
