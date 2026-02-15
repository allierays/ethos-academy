import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rubric",
  description:
    "The Ethos behavioral rubric: 3 dimensions, 12 traits, and 214 indicators for measuring AI agent honesty, reasoning, and emotional intelligence.",
};

export default function RubricLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
