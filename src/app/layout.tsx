import { Poppins, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'GComprobantes — Garnier',
  description: 'Gestión de comprobantes de pago — Corporación Garnier',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
};

// Tipografía del sistema de diseño Garnier (igual que Gpeople):
// Poppins para títulos y DM Sans para el cuerpo. Se exponen como variables
// CSS que globals.css toma en --gp-font-head / --gp-font-body.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--gp-font-body)',
              fontSize: '13px',
              color: 'var(--gp-text-primary)',
              background: '#ffffff',
              border: '1px solid var(--gp-border)',
              borderRadius: '10px',
              boxShadow: 'var(--gp-shadow-lg)',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#587615', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#b03030', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  );
}
