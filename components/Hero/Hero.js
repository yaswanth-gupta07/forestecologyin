import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { cleanupChannel, supabase } from "@/lib/supabase";
import image1 from "../../images/1.jpeg";
import image2 from "../../images/2.jpeg";
import image3 from "../../images/3.jpeg";
import image4 from "../../images/4.jpeg";
import image5 from "../../images/5.jpeg";
import image6 from "../../images/6.jpeg";
import image7 from "../../images/7.jpeg";
import image8 from "../../images/8.jpeg";
import image9 from "../../images/9.jpeg";
import image10 from "../../images/10.jpeg";
import image11 from "../../images/11.jpeg";
import image12 from "../../images/12.jpeg";
import image13 from "../../images/13.jpeg";
import image14 from "../../images/14.jpeg";
import image15 from "../../images/15.jpeg";

const bundledImages = [
  image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12, image13, image14, image15,
];

const IMAGE_ROTATION_MS = 6000;
const IMAGE_CROSSFADE_DURATION = 1.5;

function toSrc(img) {
  if (typeof img === "string") return img;
  return img?.src || "";
}

export default function Hero() {
  const [slideUrls, setSlideUrls] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedSrcs, setFailedSrcs] = useState({});
  const [visibleSrc, setVisibleSrc] = useState("");

  const heroUrls = useMemo(() => {
    if (slideUrls && slideUrls.length > 0) return slideUrls;
    return bundledImages.map(toSrc);
  }, [slideUrls]);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data } = await supabase
          .from("hero_slides")
          .select("image_url, sort_order, created_at")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });
        if (data?.length) {
          setSlideUrls(data.map((r) => optimizeCloudinaryUrl(r.image_url)).filter(Boolean));
        } else {
          setSlideUrls([]);
        }
      } catch {
        setSlideUrls([]);
      }
    }

    fetchSlides();

    const channel = supabase
      .channel("hero-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_slides" }, () => {
        fetchSlides();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  useEffect(() => {
    setActiveImageIndex((i) => (heroUrls.length ? i % heroUrls.length : 0));
  }, [heroUrls.length]);

  useEffect(() => {
    if (!heroUrls.length) return undefined;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % heroUrls.length);
    }, IMAGE_ROTATION_MS);
    return () => clearInterval(timer);
  }, [heroUrls.length]);

  const goTo = (index) => {
    if (!heroUrls.length) return;
    setActiveImageIndex(((index % heroUrls.length) + heroUrls.length) % heroUrls.length);
  };

  const goPrev = () => goTo(activeImageIndex - 1);
  const goNext = () => goTo(activeImageIndex + 1);

  const currentSrc = heroUrls[activeImageIndex] || "";
  const displaySrc = failedSrcs[currentSrc]
    ? `/placeholders/gallery.svg?v=${activeImageIndex}`
    : currentSrc;
  const imageKey = `${activeImageIndex}-${visibleSrc}`;

  useEffect(() => {
    if (!displaySrc) {
      setVisibleSrc("/placeholders/gallery.svg");
      return;
    }

    let cancelled = false;
    const preload = new window.Image();
    preload.src = displaySrc;
    preload.onload = () => {
      if (!cancelled) setVisibleSrc(displaySrc);
    };
    preload.onerror = () => {
      if (cancelled) return;
      if (currentSrc && !failedSrcs[currentSrc]) {
        setFailedSrcs((prev) => ({ ...prev, [currentSrc]: true }));
      }
      setVisibleSrc(`/placeholders/gallery.svg?v=${activeImageIndex}`);
    };

    return () => {
      cancelled = true;
    };
  }, [activeImageIndex, currentSrc, displaySrc, failedSrcs]);

  useEffect(() => {
    if (!heroUrls.length) return;
    const nextSrc = heroUrls[(activeImageIndex + 1) % heroUrls.length];
    if (!nextSrc) return;
    const preloadNext = new window.Image();
    preloadNext.src = nextSrc;
  }, [activeImageIndex, heroUrls]);

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-[#081C15]">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={imageKey}
            className="absolute inset-0 will-change-transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src={visibleSrc || "/placeholders/gallery.svg"}
              alt="Forest Ecology hero slide"
              fill
              priority={activeImageIndex === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#081C15]/40" />
      </div>

      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Previous image"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Next image"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 md:gap-2">
        {heroUrls.map((_, i) => (
          <button
            key={`${i}-${heroUrls[i]?.slice?.(0, 24)}`}
            type="button"
            onClick={() => goTo(i)}
            className={`h-1.5 w-2 flex-none rounded-sm transition-colors md:h-1.5 md:min-w-[20px] md:max-w-[32px] md:flex-1 ${
              i === activeImageIndex ? "bg-[#63D3A6]" : "bg-white/80"
            }`}
            aria-label={`Go to image ${i + 1} of ${heroUrls.length}`}
          />
        ))}
      </div>
    </section>
  );
}
