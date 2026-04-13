import Head from "next/head";
import Hero from "../../components/Hero/Hero";
import GovernmentHeader from "../../components/GovernmentHeader";
import Footer from "../../components/Footer/Footer";
import HomeAbout from "../../components/Home/HomeAbout";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden bg-[#081C15] text-[#E8F8EE]">
      <Head>
        <title>Forest Ecology Lab | Home</title>
        <meta name="description" content="Forest Ecology and Management Research Lab: biodiversity, climate resilience, and ecosystem monitoring." />
      </Head>
      <GovernmentHeader />
      <Hero />

      <main className="relative z-10">
        <HomeAbout />
      </main>

      <Footer />
    </div>
  );
}
