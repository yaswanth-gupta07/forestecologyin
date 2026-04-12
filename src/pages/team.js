import GovernmentHeader from "../../components/GovernmentHeader";
import Team from "../../components/Team/Team";
import Footer from "../../components/Footer/Footer";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#081C15] text-[#E8F8EE]">
      <GovernmentHeader />
      <main className="pt-6">
        <Team />
      </main>
      <Footer />
    </div>
  );
}
