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
  return   (
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
                <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                    background: '#0f0f11',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    padding: '12px 18px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  },
                     icon: null,
                  success: {
                    style: {
                      background: '#0f0f11',
                         border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#fff',
                    },
                    icon: null,
                  },
                  error: {
                    style: {
                      background: '#0f0f11',
                      border: '1px solid rgba(255, 77, 0, 0.4)',

                         color: '#fff',
                    },
                    icon: null,
                  },
                  blank: {
                    style: {
                      background: '#0f0f11',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                         color: '#fff',
                    },
                    icon: null,
                  },
                }}
              />
            </BookmarkProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
