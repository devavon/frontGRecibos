"use client";
import React from "react";
import { Petit_Formal_Script } from 'next/font/google';

const petitFormal = Petit_Formal_Script({
  subsets: ['latin'],
  weight: ['400'],  // fuente delgada y ligera
});

export const Nav: React.FC = () => {
  return (
    <nav className="bg-black py-2 px-4">
      <h2 className="text-lime-500 text-3xl font-bold text-left">
        DOCUMENTAL DE PAGOS
      </h2>
      <p className={`${petitFormal.className} text-lime-500 text-base text-left mt-1`}>
        by Garnier
      </p>
    </nav>
  );
};
