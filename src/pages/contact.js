import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import GovernmentHeader from "../../components/GovernmentHeader";
import Footer from "../../components/Footer/Footer";
import { cleanupChannel, supabase } from "@/lib/supabase";
import { SITE_SETTING_DEFAULTS } from "@/lib/siteSettingKeys";

async function loadContactInfo() {
  const keys = ["contact_email", "contact_phone"];
  const { data } = await supabase.from("site_settings").select("key, value").in("key", keys);
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  const emailRaw = String(map.contact_email ?? "").trim().toLowerCase();
  const phoneRaw = String(map.contact_phone ?? "").trim();
  const hasDummyEmail =
    !emailRaw ||
    emailRaw === "forestlab@example.org" ||
    emailRaw.includes("example.org");
  const hasDummyPhone =
    !phoneRaw ||
    phoneRaw === "+00 0000 000 000" ||
    phoneRaw.includes("000");
  return {
    email: hasDummyEmail ? SITE_SETTING_DEFAULTS.contact_email : map.contact_email,
    phone: hasDummyPhone ? SITE_SETTING_DEFAULTS.contact_phone : map.contact_phone,
  };
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [contactEmail, setContactEmail] = useState(SITE_SETTING_DEFAULTS.contact_email);
  const [contactPhone, setContactPhone] = useState(SITE_SETTING_DEFAULTS.contact_phone);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await loadContactInfo();
      if (!cancelled) {
        setContactEmail(c.email);
        setContactPhone(c.phone);
      }
    })();

    const channel = supabase
      .channel("site-settings-contact")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        loadContactInfo().then((c) => {
          if (!cancelled) {
            setContactEmail(c.email);
            setContactPhone(c.phone);
          }
        });
      })
      .subscribe();

    return () => {
      cancelled = true;
      cleanupChannel(channel);
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSending(true);
    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      ]);
      if (error) throw error;
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setSubmitError(err?.message || "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <Head>
        <title>Forest Ecology Lab | Contact</title>
        <meta name="description" content="Contact the Forest Ecology Lab for collaboration, field research, and academic partnerships." />
      </Head>
      <GovernmentHeader />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-[#123326]/40 p-8 shadow-[0_22px_50px_rgba(0,0,0,0.25)] md:p-12"
        >
          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Get in touch </h1>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0E281D]/70 p-5">
              <h2 className="text-lg font-semibold text-[#F1FBF6]">Email</h2>
              <p className="mt-2 text-sm text-[#C8E9D7] break-all">{contactEmail}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0E281D]/70 p-5">
              <h2 className="text-lg font-semibold text-[#F1FBF6]">Phone</h2>
              <p className="mt-2 text-sm text-[#C8E9D7]">{contactPhone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#C8E9D7]">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#0E281D]/60 px-4 py-3 text-[#E8F8EE] placeholder-[#63D3A640] focus:border-[#63D3A6] focus:outline-none focus:ring-1 focus:ring-[#63D3A6]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#C8E9D7]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#0E281D]/60 px-4 py-3 text-[#E8F8EE] placeholder-[#63D3A640] focus:border-[#63D3A6] focus:outline-none focus:ring-1 focus:ring-[#63D3A6]"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#C8E9D7]">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#0E281D]/60 px-4 py-3 text-[#E8F8EE] placeholder-[#63D3A640] focus:border-[#63D3A6] focus:outline-none focus:ring-1 focus:ring-[#63D3A6]"
                placeholder="e.g. Research collaboration inquiry"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#C8E9D7]">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-[#0E281D]/60 px-4 py-3 text-[#E8F8EE] placeholder-[#63D3A640] focus:border-[#63D3A6] focus:outline-none focus:ring-1 focus:ring-[#63D3A6]"
                placeholder="Your message..."
              />
            </div>
            {submitError && (
              <p className="text-sm text-red-300">{submitError}</p>
            )}
            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[#63D3A6]"
              >
                Thank you! Your message has been sent. We&apos;ll get back to you soon.
              </motion.p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="rounded-full border border-[#63D3A6] bg-[#63D3A630] px-8 py-3 text-sm font-medium text-[#E8F8EE] transition hover:bg-[#63D3A640] focus:outline-none focus:ring-2 focus:ring-[#63D3A6] focus:ring-offset-2 focus:ring-offset-[#081C15] disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
