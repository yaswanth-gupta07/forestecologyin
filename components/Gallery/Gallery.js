import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

const hardcodedImages = [
  { id: 1, title: "Forest Canopy Light", src: image1, span: "lg:col-span-2 lg:row-span-2" },
  { id: 2, title: "Ecology Field Frame", src: image2, span: "lg:col-span-1 lg:row-span-1" },
  { id: 3, title: "Sampling Team", src: image3, span: "lg:col-span-1 lg:row-span-1" },
  { id: 4, title: "Forest Habitat Study", src: image4, span: "lg:col-span-1 lg:row-span-1" },
  { id: 5, title: "Biodiversity Indicator", src: image5, span: "lg:col-span-1 lg:row-span-2" },
  { id: 6, title: "Forest Structure", src: image6, span: "lg:col-span-1 lg:row-span-1" },
  { id: 7, title: "Understory Survey", src: image7, span: "lg:col-span-1 lg:row-span-1" },
  { id: 8, title: "Mist Canopy", src: image8, span: "lg:col-span-1 lg:row-span-2" },
  { id: 9, title: "Forest Transition Zone", src: image9, span: "lg:col-span-1 lg:row-span-1" },
  { id: 10, title: "Research Landscape", src: image10, span: "lg:col-span-1 lg:row-span-1" },
  { id: 11, title: "Canopy Corridor", src: image11, span: "lg:col-span-1 lg:row-span-1" },
  { id: 12, title: "Biodiversity Monitoring", src: image12, span: "lg:col-span-1 lg:row-span-1" },
  { id: 13, title: "Field Observation", src: image13, span: "lg:col-span-1 lg:row-span-1" },
  { id: 14, title: "Forest Remote Sensing", src: image14, span: "lg:col-span-1 lg:row-span-1" },
  { id: 15, title: "Conservation Survey", src: image15, span: "lg:col-span-2 lg:row-span-1" },
];

export default function Gallery() {
  const [activeImage, setActiveImage] = useState(null);
  const [failedImageIds, setFailedImageIds] = useState({});
  const [dbImages, setDbImages] = useState([]);

  useEffect(() => {
    fetchFromSupabase();

    const channel = supabase
      .channel("gallery-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery" }, () => {
        fetchFromSupabase();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchFromSupabase() {
    try {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDbImages(data);
    } catch {}
  }

  const images = [
    ...hardcodedImages,
    ...dbImages.map((img) => ({
      id: `db-${img.id}`,
      title: img.title,
      src: img.image_url,
      span: "lg:col-span-1 lg:row-span-1",
      isExternal: true,
    })),
  ];

  const getSource = (item) => (failedImageIds[item.id] ? "/placeholders/gallery.svg" : item.src);

  const handleImageError = (id) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
      >
       
        <h2 className="mt-3 text-4xl font-semibold text-[#E8F8EE] md:text-6xl">Forest Gallery</h2>
        <p className="mt-5 max-w-2xl text-[#C5E8D6]">
          Landscapes, field operations, and biodiversity moments captured across seasonal campaigns.
        </p>
      </motion.div>

      <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.06 }}
            whileHover={{ y: -5, scale: 1.01 }}
            className={`group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#112F23]/35 text-left shadow-[0_16px_42px_rgba(0,0,0,0.22)] ${item.span}`}
            onClick={() => setActiveImage(item)}
          >
            <div className="relative h-full w-full">
              {item.isExternal ? (
                <img
                  src={getSource(item)}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  onError={() => handleImageError(item.id)}
                />
              ) : (
                <Image
                  src={getSource(item)}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  onError={() => handleImageError(item.id)}
                />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081C15]/88 via-[#081C15]/32 to-transparent p-4">
              <p className="text-sm text-[#EAF7EF]">{item.title}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020705]/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0C241A]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-[16/9]">
                {activeImage.isExternal ? (
                  <img
                    src={getSource(activeImage)}
                    alt={activeImage.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => handleImageError(activeImage.id)}
                  />
                ) : (
                  <Image
                    src={getSource(activeImage)}
                    alt={activeImage.title}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(activeImage.id)}
                  />
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="text-sm text-[#D8F0E3]">{activeImage.title}</p>
                <button
                  type="button"
                  onClick={() => setActiveImage(null)}
                  className="rounded-lg border border-white/20 px-3 py-1 text-xs text-[#E4F5EC]"
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
