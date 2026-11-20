import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Axioma-X | De WhatsApp a Cotización PDF en 15 segundos",
  description:
    "Plataforma inteligente de cotizaciones comerciales para PyMEs y profesionales. Convierte mensajes informales, voz o fotos en cotizaciones PDF con enlace de aprobación al instante.",
  icons: {
    icon: "/brand/axioma-logo.png",
    apple: "/brand/axioma-logo.png",
  },
  openGraph: {
    title: "Axioma-X | Cotizador Inteligente",
    description:
      "Convierte mensajes de WhatsApp, voz o fotos en cotizaciones PDF profesionales en segundos.",
    images: ["/brand/axioma-banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`scroll-smooth ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
