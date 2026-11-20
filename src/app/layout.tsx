import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GroqChatbox } from "@/components/GroqChatbox";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html
      lang="es"
      suppressHydrationWarning
      className={`dark scroll-smooth ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('axioma-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans transition-colors duration-300 selection:bg-blue-500/25 selection:text-blue-900 dark:selection:text-sky-200">
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <GroqChatbox />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
