import type { Metadata } from "next";
import "./globals.css";
import EmotionRegistry from "./emotion-registry";
import { ThemeProvider } from "./theme-provider";
import { CssBaseline } from "@mui/material";

export const metadata: Metadata = {
  title: "YouTube Audiobook Script Generator",
  description: "Generate shell scripts for downloading YouTube audiobooks with yt-dlp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
