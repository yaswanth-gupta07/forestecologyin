import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { defaultCollaborators } from "@/lib/collaboratorsDefaults";
import sreenathPhoto from "../../images/team/sreenath.png";
import sharanaPhoto from "../../images/team/Sharana.jpg";
import albertPhoto from "../../images/team/Albert.jpg";
import dilipPhoto from "../../images/team/Dilip.jpg";
import swedhaPhoto from "../../images/team/Swedha.jpg";
import vyshakhPhoto from "../../images/team/Vyshakh.png";
import vijayalakshmiPhoto from "../../images/team/Vijayalakshmi.jpg";
import premPhoto from "../../images/team/prem.jpg";
const members = [
  {
    name: "Sreenath Subrahmanyam",
    role: "Principal Investigator",
    tagline: "From rainforest trails to climate science - protecting forests and understanding biodiversity.",
    photo: sreenathPhoto,
    bio: [
      "I discovered my love for biology at 16 while trekking through the rain-soaked Western Ghats in Kerala, India, on the way to Sabarimala. Those monsoon walks through one of the world's richest biodiversity hotspots sparked a fascination with tropical forests.",
      "My research explores how climate change impacts forest ecosystems, and my team is building a global database of forest adaptation strategies, collecting data in the United States, the United Kingdom, and India. My goal is to understand how forests respond to environmental change and use that knowledge to guide conservation.",
      "The most rewarding part of my work is collaborating with bright young minds from around the world, exploring ecosystems, and inspiring the next generation of scientists. Through annual training programs in the US and India, I aim to help students discover the same sense of wonder in nature that first inspired me.",
    ],
  },
  {
    name: "Sharana Basavana Gouda",
    role: "PhD Researcher",
    tagline: "Exploring forests, tracking invasions, and uncovering patterns that shape biodiversity.",
    photo: sharanaPhoto,
    bio: [
      "I am an environmental science researcher with a strong interest in understanding how ecosystems function and how biodiversity can be conserved in rapidly changing landscapes. My work focuses on invasion ecology, forest dynamics, and landscape-level ecological patterns.",
      "I completed my MSc in Environmental Science from Kuvempu University and hold a BSc in Chemistry, Botany, and Zoology from VSKUB University. Before starting my PhD, I worked as a Project Assistant under the Indian Council for Forestry Research and Education at the Indian Institute of Science, Bangalore, where I gained hands-on experience in ecological field research.",
      "Currently, I am a PhD researcher at SRM University-AP, working with Sreenath to examine the distribution and ecological impacts of invasive plant species using field surveys and remote sensing.",
    ],
  },
  {
    name: "Albert Suresh",
    role: "PhD Researcher",
    tagline: "Understanding tropical ecosystems through plant-animal interactions and long-term ecology.",
    photo: albertPhoto,
    bio: [
      "I am a PhD researcher in Ecology at SRM University-AP with research interests in plant ecology, forest dynamics, and species interactions in tropical ecosystems. My work focuses on plant-animal interactions and the ecological processes that shape vegetation structure and community assembly.",
      "A central part of my research examines the foraging ecology of Asian elephants and how their feeding behaviour influences forest ecosystems, including seed movement and plant recruitment mediated by large herbivores.",
      "I gained extensive field-based experience in Mudumalai Tiger Reserve with the Centre for Ecological Sciences at IISc, where I worked on long-term monitoring of regeneration, mortality, litterfall, and phenological variation across forest types.",
    ],
  },
  {
    name: "Dilip Senapati",
    role: "Graduate Researcher",
    tagline: "Exploring forest dynamics from space through geospatial science.",
    photo: dilipPhoto,
    bio: [
      "I am a Graduate student in Environmental Science and Engineering with research interests in forest ecology, remote sensing, and geospatial analysis for ecosystem monitoring.",
      "My research focuses on using multi-temporal satellite imagery to analyze vegetation dynamics and estimate biomass in forest ecosystems. Using Landsat and Sentinel datasets, I apply raster and geospatial analytical methods to assess spatial and temporal patterns.",
      "Through the integration of remote sensing and spatial modelling approaches, my research contributes to improving large-scale forest monitoring techniques for carbon, productivity, and sustainable management.",
    ],
  },
  {
    name: "Swedha P Sudevan",
    role: "PhD Researcher",
    tagline: "Studying canopies, phenology, and biodiversity signals in tropical forests.",
    photo: swedhaPhoto,
    bio: [
      "I am a PhD researcher in the Department of Environmental Science and Engineering at SRM University, AP. I am interested in understanding forest ecosystem dynamics and how vegetation structure influences biodiversity patterns in tropical landscapes.",
      "My work focuses on canopy cover, phenology, leaf area index, and biodiversity estimation. I completed my integrated BSc-MSc in Climate Change Adaptation from Kerala Agricultural University.",
      "My field and analytical studies in Wayanad Wildlife Sanctuary and Nagarjuna Sagar-Srisailam Tiger Reserve are aimed at improving ecological monitoring and conservation strategies in protected forest landscapes.",
    ],
  },
  {
    name: "Vyshakh A",
    role: "PhD Scholar",
    tagline: "Connecting conservation biology, fire ecology, and biodiversity research for resilient forests.",
    photo: vyshakhPhoto,
    bio: [
      "I have had a strong interest in conservation biology since my high school years, when observing seabirds along the beaches near my native place in Kerala sparked my curiosity about wildlife and ecosystems.",
      "After completing a BSc in Chemistry and an MSc in Environmental Science, I joined SRM University, Andhra Pradesh, where I work with Sreenath Subrahmanyam.",
      "My doctoral research focuses on the ecological impacts of forest fires on biodiversity and ecosystem dynamics in the Nagarjunsagar-Srisailam Tiger Reserve.",
    ],
  },
  {
    name: "Vijayalakshmi P",
    role: "Graduate Researcher",
    tagline: "Applying geospatial technologies for better ecosystem management.",
    photo: vijayalakshmiPhoto,
    bio: [
      "I currently work as an Online Teaching Assistant at SRM University, Andhra Pradesh, helping undergraduate and postgraduate students learn ArcGIS, QGIS, and ERDAS Imagine.",
      "I completed my MSc in Environmental Science from Bharathidasan University, Tiruchirappalli, where I secured first rank in my program.",
      "My interests include remote sensing and GIS applications in forest ecology, landscape pattern analysis, and ecosystem management, including project work at NRSC-ISRO on mangrove and landscape mapping.",
    ],
  },
  {
    name: "Prem Sujit Singh",
    role: "Postgraduate Researcher",
    tagline:
      "Exploring ecosystems through science - linking field ecology, remote sensing, and biodiversity for climate solutions.",
    photo: premPhoto,
    bio: [
      "I am a postgraduate student in Environmental Science with a strong interest in forest ecosystems and their role in biodiversity conservation and climate change mitigation.",
      "I completed my Bachelor's degree in Zoology from Vartak College, Vasai, under the University of Mumbai, where I developed a strong foundation in biodiversity, ecology, and environmental science.",
      "My current research focuses on estimating forest biomass and carbon sequestration using remote sensing and spatial analysis to support sustainable forest management.",
    ],
  },
];

function memberBioParagraphs(m) {
  if (m.bio && m.bio.trim()) {
    return m.bio
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  if (m.description && m.description.trim()) {
    return [m.description.trim()];
  }
  return [];
}

function ProfileImageWithFallback({ src, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setCurrentSrc(src); setFailed(false); }, [src]);

  return (
    <Image
      src={failed ? "/placeholders/profile.svg" : currentSrc}
      alt={alt}
      fill
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 33vw"
      className={className}
      onError={() => { setFailed(true); setCurrentSrc("/placeholders/profile.svg"); }}
    />
  );
}

export default function Team() {
  const [expanded, setExpanded] = useState(null);
  const [dbMembers, setDbMembers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [head, ...teamMembers] = members;

  useEffect(() => {
    fetchFromSupabase();

    const channel = supabase
      .channel("team-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "team" }, () => {
        fetchFromSupabase();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchCollaborators();

    const channel = supabase
      .channel("collaborators-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborators" }, () => {
        fetchCollaborators();
      })
      .subscribe();

    return () => {
      cleanupChannel(channel);
    };
  }, []);

  async function fetchFromSupabase() {
    try {
      const { data } = await supabase
        .from("team")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setDbMembers(data);
    } catch {
      /* ignore */
    }
  }

  async function fetchCollaborators() {
    try {
      const { data } = await supabase
        .from("collaborators")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (data) setCollaborators(data);
    } catch {
      /* ignore */
    }
  }

  const collaboratorList =
    collaborators.length > 0
      ? collaborators.map((row) => ({
          ...row,
          title: row.title ?? "",
          address: row.address ?? "",
          affiliation: row.affiliation ?? "",
        }))
      : defaultCollaborators;

  const allTeamMembers = [
    ...teamMembers,
    ...dbMembers.map((m) => ({
      name: m.name,
      role: m.role,
      tagline: (m.tagline && m.tagline.trim()) || "",
      photo: optimizeCloudinaryUrl(m.image_url) || "/placeholders/profile.svg",
      bio: memberBioParagraphs(m),
    })),
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
      >
       
        <h2 className="mt-3 text-4xl font-semibold text-[#E8F8EE] md:text-6xl">Research Team</h2>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65 }}
        className="mt-12 grid gap-6 rounded-3xl border border-[#63D3A650] bg-[#123325]/48 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] md:grid-cols-[220px_1fr]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/20">
          <ProfileImageWithFallback src={head.photo} alt={`${head.name} portrait`} className="object-cover" />
        </div>
        <div>
          <h3 className="text-3xl font-semibold text-[#ECF9F1] md:text-4xl">{head.name}</h3>
          <p className="mt-1 text-sm text-[#8CE0BD]">{head.role}</p>
          <p className="mt-4 rounded-xl border border-[#63D3A635] bg-[#0F2B1F]/70 px-4 py-3 text-sm text-[#D8F4E7]">
            {head.tagline}
          </p>
          <div className="mt-4 space-y-3">
            {head.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="max-w-3xl text-sm leading-relaxed text-[#C8E9D7]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </motion.article>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allTeamMembers.map((member, index) => (
          <motion.article
            key={member.name}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="rounded-2xl border border-white/10 bg-[#123325]/42 p-5 shadow-[0_16px_44px_rgba(0,0,0,0.28)]"
          >
            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-white/15">
              <ProfileImageWithFallback src={member.photo} alt={`${member.name} profile`} className="object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-[#ECF9F1]">{member.name}</h3>
            <p className="mt-1 text-sm text-[#8CE0BD]">{member.role}</p>
            {member.tagline ? (
              <p className="mt-3 rounded-lg border border-[#63D3A633] bg-[#0F2B1F]/65 p-3 text-xs leading-relaxed text-[#D8F4E7]">
                {member.tagline}
              </p>
            ) : null}
            {member.bio[0] ? (
              <p className="mt-3 text-sm leading-relaxed text-[#C8E9D7]">{member.bio[0]}</p>
            ) : null}
            {expanded === member.name ? (
              <div className="mt-3 space-y-3">
                {member.bio.slice(1).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-[#C8E9D7]">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {member.bio.length > 1 ? (
              <button
                type="button"
                onClick={() => setExpanded((prev) => (prev === member.name ? null : member.name))}
                className="mt-4 rounded-full border border-[#63D3A67a] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#D5F3E3] transition hover:bg-[#63D3A621]"
              >
                {expanded === member.name ? "Show Less" : "Read Full Profile"}
              </button>
            ) : null}
          </motion.article>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
        className="mt-20"
        id="collaborators"
      >
        <h2 className="text-4xl font-semibold text-[#E8F8EE] md:text-6xl">Collaborators</h2>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collaboratorList.map((person, index) => (
          <motion.article
            key={person.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#123325]/42 shadow-[0_16px_44px_rgba(0,0,0,0.28)]"
          >
            <div className="relative aspect-square w-full overflow-hidden border-b border-white/10">
              {person.image_url ? (
                <ProfileImageWithFallback
                  src={optimizeCloudinaryUrl(person.image_url)}
                  alt={person.name}
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0F2B1F]/90 text-5xl font-semibold text-[#63D3A6] sm:text-6xl md:text-7xl">
                  {person.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="p-5 md:p-6">
              <h3 className="text-lg font-semibold text-[#ECF9F1] md:text-xl">{person.name}</h3>
              {person.title ? (
                <p className="mt-1 text-sm font-medium text-[#63D3A6] md:text-[0.95rem]">{person.title}</p>
              ) : null}
              {person.affiliation ? (
                <p className="mt-3 text-sm leading-relaxed text-[#8CE0BD] whitespace-pre-line">{person.affiliation}</p>
              ) : null}
              {person.address ? (
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-[#C8E9D7]/90 whitespace-pre-line md:text-sm">
                  {person.address}
                </p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
