import Head from "next/head";
import GovernmentHeader from "../../components/GovernmentHeader";
import Team from "../../components/Team/Team";
import Footer from "../../components/Footer/Footer";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <Head>
        <title>Forest Ecology Lab | Team</title>
        <meta name="description" content="Meet the Forest Ecology Lab team and global collaborators across ecology and geospatial research." />
      </Head>
      <GovernmentHeader />
      <main className="pt-20">
        <Team />
      </main>
      <Footer />
    </div>
  );
}
