import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { SITE_SETTING_DEFAULTS } from "@/lib/siteSettingKeys";
import image1 from "../../images/1.jpeg";
import image3 from "../../images/3.jpeg";
import image5 from "../../images/5.jpeg";
import image8 from "../../images/8.jpeg";

const hardcodedTopics = [
  {
    id: "hc-invasion",
    title: "Invasion Ecology",
    description: "Mapping spread dynamics of invasive species across sensitive forest corridors.",
    gallery: [image3],
  },
  {
    id: "hc-dynamics",
    title: "Forest Dynamics",
    description: "Understanding long-term structural change, regeneration, and disturbance response.",
    gallery: [image8],
  },
  {
    id: "hc-carbon",
    title: "Carbon & Biomass Estimation",
    description: "Estimating carbon stocks and biomass distribution using integrated field data.",
    gallery: [image5],
  },
  {
    id: "hc-biodiversity",
    title: "Biodiversity Monitoring",
    description: "Combining acoustic and visual sampling to track species richness over time.",
    gallery: [image1],
  },
  {
    id: "hc-geospatial",
    title: "Geospatial Ecology",
    description: "Using remote sensing and GIS models to decode ecosystem-scale ecological trends.",
    gallery: [image3],
  },
];

function normalizeResearchGallery(row) {
  const extra = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  const urls = [];
  if (row.image_url) urls.push(row.image_url);
  for (const u of extra) {
    if (u && !urls.includes(u)) urls.push(u);
  }
  if (urls.length) return urls;
  return ["/placeholders/research.svg"];
}

const ResearchModal = dynamic(() => import("./ResearchModal"), { ssr: false });

function ImageWithFallback({ src, alt }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  return (
    <Image
      src={failed ? "/placeholders/research.svg" : currentSrc}
      alt={alt}
      fill
      loading="lazy"
      sizes="(max-width: 1024px) 100vw, 33vw"
      className="object-cover transition duration-700 group-hover:scale-110"
      onError={() => {
        setFailed(true);
        setCurrentSrc("/placeholders/research.svg");
      }}
    />
  );
}

export default function ResearchAreas() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [dbTopics, setDbTopics] = useState([]);
  const [intro, setIntro] = useState(SITE_SETTING_DEFAULTS.research_intro);

  const loadIntro = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "research_intro")
      .maybeSingle();
    if (data?.value != null && data.value !== "") {
      setIntro(data.value);
    } else {
      setIntro(SITE_SETTING_DEFAULTS.research_intro);
    }
  }, []);

  useEffect(() => {
    loadIntro();
    const ch = supabase
      .channel("site-settings-research-intro")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, (payload) => {
        if (payload.new?.key === "research_intro" || payload.old?.key === "research_intro") {
          loadIntro();
        }
      })
      .subscribe();
    return () => {
      cleanupChannel(ch);
    };
  }, [loadIntro]);

  useEffect(() => {
    fetchFromSupabase();

    const channel = supabase
      .channel("research-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "research" }, () => {
        fetchFromSupabase();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  async function fetchFromSupabase() {
    try {
      const { data } = await supabase
        .from("research")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDbTopics(data);
    } catch {
      /* ignore */
    }
  }

  const researchTopics = [
    ...hardcodedTopics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      cover: t.gallery[0],
      gallery: t.gallery,
      isExternal: false,
    })),
    ...dbTopics.map((item) => {
      const gallery = normalizeResearchGallery(item);
      const cover = optimizeCloudinaryUrl(gallery[0]);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        cover,
        gallery,
      isExternal: typeof cover === "string" && /^https?:\/\//i.test(cover),
      };
    }),
  ];

  const openTopic = (topic) => {
    setSelectedTopic(topic);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:pt-16 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.75 }}
      >
        <h2 className="mt-3 text-4xl font-semibold text-[#E8F8EE] md:text-6xl">Research Areas</h2>
        <p className="mt-5 max-w-2xl text-[#C5E8D6] whitespace-pre-wrap">{intro}</p>
      </motion.div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {researchTopics.map((topic, index) => (
          <motion.button
            key={topic.id}
            type="button"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: index * 0.06 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-[#112E22]/40 text-left shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
            onClick={() => openTopic(topic)}
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <ImageWithFallback
                src={topic.cover}
                alt={`${topic.title} visual`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07170f]/70 via-transparent to-transparent" />
              {topic.gallery?.length > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                  {topic.gallery.length} photos
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-[#EBF8F0]">{topic.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#C6E8D8]">{topic.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <ResearchModal
        selectedTopic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
      />
    </section>
  );
}
