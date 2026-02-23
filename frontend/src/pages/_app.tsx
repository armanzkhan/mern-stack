import "@/css/satoshi.css";
import "@/css/style.css";
import type { AppProps } from "next/app";

/**
 * Pages Router app — minimal. /auth/sign-in is now served by App Router (app/auth/sign-in/page.tsx) for single React bundle.
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
