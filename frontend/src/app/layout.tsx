import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Layout } from "@/components/Layout";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_NAME = "quiz-builder";
const DEFAULT_DESCRIPTION =
  "Build quizzes with true/false, short-answer and multiple-choice questions, and review the answer key at a glance.";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  other: {
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans text-ink antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
