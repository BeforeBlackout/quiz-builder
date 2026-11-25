import type { Metadata } from "next";

import { NotFoundState } from "@/components/ui/NotFoundState";

export const metadata: Metadata = {
  title: "Not found",
  description: "This page doesn't exist or has been deleted.",
};

export default function NotFound() {
  return <NotFoundState title="Not found" message="That page is not in the database." />;
}
