import "../../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-w-0 w-full max-w-[100vw] overflow-x-hidden">
      <Component {...pageProps} />
    </div>
  );
}
