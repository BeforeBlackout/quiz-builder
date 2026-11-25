import { Inter } from "next/font/google";
import type { AppProps } from "next/app";

import { Layout } from "@/components/Layout";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} font-sans text-ink antialiased`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
