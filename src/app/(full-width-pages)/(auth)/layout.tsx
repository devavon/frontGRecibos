import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 dark:from-gray-800 dark:via-gray-900 dark:to-black lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-md px-8">
                <Link href="/" className="block mb-6">
                  <div className="text-center">
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                      GRecibos
                    </h1>
                    <div className="h-1 w-24 bg-blue-400 mx-auto mt-3 rounded-full"></div>
                  </div>
                </Link>
                <p className="text-center text-blue-200 dark:text-gray-300 text-lg font-light">
                  Gestión de comprobantes de pago
                </p>
                <div className="mt-8 pt-6 border-t border-blue-700/50">
                  <p className="text-center text-blue-300/80 text-sm font-medium tracking-wide">
                    Garnier y Garnier
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
