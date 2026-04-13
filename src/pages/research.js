import Head from "next/head";
import GovernmentHeader from "../../components/GovernmentHeader";
import ResearchAreas from "../../components/ResearchAreas/ResearchAreas";
import Footer from "../../components/Footer/Footer";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <Head>
        <title>Forest Ecology Lab | Research</title>
        <meta name="description" content="Research areas in invasion ecology, forest dynamics, biodiversity, and geospatial ecology." />
      </Head>
      <GovernmentHeader />
      <main className="pt-20">
        <ResearchAreas />
      </main>
      <Footer />
    </div>
  );
}
