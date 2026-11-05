/* eslint-disable @next/next/no-img-element */
// GComprobantesLogo — Marca "GComprobantes by GARNIER" con el mismo lenguaje
// del logo oficial de Gpeople: isotipo doble G verde Garnier (#B2D234) +
// palabra en gris de marca (#58585B) + "by GARNIER" alineado a la derecha.
//
// El isotipo es el archivo oficial del diseñador (copiado de Gpeople). La
// palabra se compone con Poppins Bold (sustituto geométrico de Hurme) hasta
// que exista un archivo editable propio de GComprobantes.
//
// Props:
//   size:    sm (28px alto) | md (44) | lg (64) | xl (96) | número en px
//   theme:   'light' (texto gris, fondos claros) | 'dark' (texto blanco, cabeceras)
//   variant: 'full' (logo completo) | 'mark' (solo la G)
import React from "react";

const SIZES = { sm: 28, md: 44, lg: 64, xl: 96 } as const;

type Props = {
  size?: keyof typeof SIZES | number;
  theme?: "light" | "dark";
  variant?: "full" | "mark";
  className?: string;
};

export default function GComprobantesLogo({
  size = "md",
  theme = "light",
  variant = "full",
  className = "",
}: Props) {
  const h = typeof size === "number" ? size : SIZES[size] ?? SIZES.md;

  const mark = (
    <img
      src="/images/logo/isotipo-color.png"
      alt={variant === "mark" ? "GComprobantes" : ""}
      width={h}
      height={h}
      style={{ display: "block", width: h, height: h, objectFit: "contain" }}
    />
  );

  if (variant === "mark") return <span className={className}>{mark}</span>;

  const wordColor = theme === "dark" ? "#ffffff" : "var(--gp-gris)";
  const byColor = theme === "dark" ? "rgba(255,255,255,0.75)" : "var(--gp-gris)";

  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap: Math.round(h * 0.16), height: h }}
      aria-label="GComprobantes by Garnier"
      role="img"
    >
      {mark}
      <span className="flex flex-col" style={{ lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "var(--gp-font-head)",
            fontWeight: 700,
            fontSize: Math.round(h * 0.6),
            letterSpacing: "-0.025em",
            color: wordColor,
            lineHeight: 0.95,
          }}
        >
          Comprobantes
        </span>
        <span
          style={{
            fontFamily: "var(--gp-font-head)",
            fontWeight: 400,
            fontSize: Math.max(7, Math.round(h * 0.19)),
            letterSpacing: "0.02em",
            color: byColor,
            alignSelf: "flex-end",
            marginTop: Math.round(h * 0.05),
          }}
        >
          by GARNIER
        </span>
      </span>
    </span>
  );
}
