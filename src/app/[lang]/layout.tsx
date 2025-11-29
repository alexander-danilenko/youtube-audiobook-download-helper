import type { Metadata } from "next";
import "../globals.css";
import EmotionRegistry from "../emotion-registry";
import { ThemeProvider } from "../theme-provider";
import { CssBaseline } from "@mui/material";

export const metadata: Metadata = {
  title: "YT Audiobook Download Helper",
  description: "Build download list in web, download with yt-dlp",
};

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }> | { lang: string };
}) {
  // For static export, we'll handle language in the page component
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <ThemeProvider>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}

// Required for static export
export function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'uk' },
  ];
}
