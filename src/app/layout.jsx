import "@/styles/globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forest-ecology-lab.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Forest Ecology Lab",
  description: "Forest Ecology and Management Research Lab website and admin portal.",
  openGraph: {
    title: "Forest Ecology Lab",
    description: "Forest Ecology and Management Research Lab website and admin portal.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
