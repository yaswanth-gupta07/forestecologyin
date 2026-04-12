import GovernmentHeader from "../../components/GovernmentHeader";
import ResearchAreas from "../../components/ResearchAreas/ResearchAreas";
import Footer from "../../components/Footer/Footer";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <GovernmentHeader />
      <main className="pt-16">
        <ResearchAreas />
      </main>
      <Footer />
    </div>
  );
}
