import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#081C15]/90">
      <div className="mx-auto flex w-[min(94%,76rem)] flex-col gap-8 px-4 py-8 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 md:py-10">
        <div className="w-full md:w-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#63D3A6]">Contact</p>
          <h3 className="mt-2 text-lg font-semibold text-[#EAF8EF] md:text-xl">Forest Ecology Lab</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#C4E8D5]">
            GMAIL: forestecology.in@gmail.com
            <br />
            PHONE: +91 8148374400
          </p>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 md:border-t-0 md:pt-0 md:items-end">
          <div className="text-left md:text-right">
            {/* <p className="text-xs uppercase tracking-[0.2em] text-[#63D3A6]/80">Website developed by</p>
            <p className="mt-1 font-medium text-[#EAF8EF]">Yaswanth</p>
            <a href="tel:+919966791692" className="mt-0.5 inline-block text-sm text-[#B9DFC9] hover:text-[#63D3A6] transition-colors">
              +91 9966791692
            </a> */}
          </div>
          
        </div>
      </div>
    </footer>
  );
}
