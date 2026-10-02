import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SixthStep — Your next step starts here",
  description: "Find work experience, make sense of opportunities, and build your future. Made for UK sixth form students."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en-GB"><body>{children}</body></html>;
}
