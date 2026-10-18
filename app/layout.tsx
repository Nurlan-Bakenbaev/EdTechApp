import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { NextAuthProvider } from "@/lib/next-auth-provider";
import { AuthProvider } from "@/lib/auth-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "BILIM — математика для 1–2 классов",
  description: "Двуязычная интерактивная школа математики для детей Кыргызстана.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <NextAuthProvider>
            <AppProviders>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </AppProviders>
          </NextAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
