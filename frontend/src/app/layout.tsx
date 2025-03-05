import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon search",
  description: "Search fluent ui icon by uploading an image or providing a URL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
