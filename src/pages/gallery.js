import Head from "next/head";
import GovernmentHeader from "../../components/GovernmentHeader";
import Gallery from "../../components/Gallery/Gallery";
import Footer from "../../components/Footer/Footer";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <Head>
        <title>Forest Ecology Lab | Gallery</title>
        <meta name="description" content="Explore field campaigns, biodiversity monitoring visuals, and forest ecology documentation." />
      </Head>
      <GovernmentHeader />
      <main className="pt-20">
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
