import "@/styles/globals.css";

export const metadata = {
  title: "Forest Ecology - Admin",
  description: "Admin dashboard for Forest Ecology and Management Research",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-[Manrope,sans-serif]">{children}</body>
    </html>
  );
}
