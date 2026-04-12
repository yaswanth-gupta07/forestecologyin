import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

function ImageWithFallback({ src, alt, isExternal }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  if (isExternal && !failed) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
        onError={() => {
          setFailed(true);
          setCurrentSrc("/placeholders/research.svg");
        }}
      />
    );
  }

  return (
    <Image
      src={failed ? "/placeholders/research.svg" : currentSrc}
      alt={alt}
      fill
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
  const [modalImageIndex, setModalImageIndex] = useState(0);
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
      supabase.removeChannel(ch);
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
      supabase.removeChannel(channel);
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
      const cover = gallery[0];
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

  useEffect(() => {
    if (!selectedTopic?.gallery?.length) {
      setModalImageIndex(0);
      return;
    }
    setModalImageIndex((i) => Math.min(i, selectedTopic.gallery.length - 1));
  }, [selectedTopic]);

  const openTopic = (topic) => {
    setModalImageIndex(0);
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
                isExternal={topic.isExternal}
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

      <AnimatePresence>
        {selectedTopic ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020705]/85 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0C241A]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                <ImageWithFallback
                  src={selectedTopic.gallery[modalImageIndex]}
                  alt={selectedTopic.title}
                  isExternal={(() => {
                    const g = selectedTopic.gallery[modalImageIndex];
                    return typeof g === "string" && /^https?:\/\//i.test(g);
                  })()}
                />
                {selectedTopic.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex(
                          (i) =>
                            (i - 1 + selectedTopic.gallery.length) % selectedTopic.gallery.length
                        );
                      }}
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex((i) => (i + 1) % selectedTopic.gallery.length);
                      }}
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                      {selectedTopic.gallery.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Photo ${i + 1}`}
                          className={`h-1.5 w-6 rounded-sm ${i === modalImageIndex ? "bg-[#63D3A6]" : "bg-white/50"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex(i);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#EBF8F0]">{selectedTopic.title}</h3>
                <p className="mt-4 text-[#C6E8D8] leading-relaxed">{selectedTopic.description}</p>
              </div>
              <div className="flex justify-end border-t border-white/10 px-6 pb-6 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-[#E4F5EC]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
