import type { Metadata, Viewport } from "next";
import { fraunces, dmSans } from "@/lib/fonts";
import StorageInit from "@/components/storage-init";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elbow Recovery",
  description: "Приложение для реабилитации локтевого сустава после ORIF — отслеживание прогресса, упражнения и дневник восстановления.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recovery",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1917" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-body bg-bg text-text antialiased">
        <ThemeProvider>
          <StorageInit />
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
