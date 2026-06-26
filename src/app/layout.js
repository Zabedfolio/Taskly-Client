import { Geist, Geist_Mono } from "next/font/google";
import ConditionalShell from "@/components/common/ConditionalShell";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Taskly — Freelance Platform",
  description: "Connect with top freelancers and get your tasks done.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <NotificationProvider>
            <BookmarkProvider>
              <ConditionalShell>
                <div>{children}</div>
              </ConditionalShell>
              <Toaster />
            </BookmarkProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
