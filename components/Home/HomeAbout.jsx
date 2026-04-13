"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { SITE_SETTING_DEFAULTS } from "@/lib/siteSettingKeys";

async function loadSettings() {
  const keys = ["home_about_title", "home_about_body"];
  const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return {
    title: map.home_about_title ?? SITE_SETTING_DEFAULTS.home_about_title,
    body: map.home_about_body ?? SITE_SETTING_DEFAULTS.home_about_body,
  };
}

export default function HomeAbout() {
  const [title, setTitle] = useState(SITE_SETTING_DEFAULTS.home_about_title);
  const [body, setBody] = useState(SITE_SETTING_DEFAULTS.home_about_body);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadSettings();
      if (!cancelled) {
        setTitle(s.title);
        setBody(s.body);
      }
    })();

    const channel = supabase
      .channel("site-settings-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        loadSettings().then((s) => {
          if (!cancelled) {
            setTitle(s.title);
            setBody(s.body);
          }
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      cleanupChannel(channel);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.28 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl border border-white/10 bg-[#123326]/40 p-8 shadow-[0_20px_52px_rgba(0,0,0,0.28)] backdrop-blur-sm md:p-12"
      >
        <h2 className="text-4xl font-semibold md:text-6xl">{title}</h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-[#C8E9D8] whitespace-pre-wrap">{body}</p>
      </motion.div>
    </section>
  );
}
