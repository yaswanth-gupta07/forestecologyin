import GovernmentHeader from "../../components/GovernmentHeader";
import Gallery from "../../components/Gallery/Gallery";
import Footer from "../../components/Footer/Footer";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <GovernmentHeader />
      <main className="pt-6">
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
