import Link from "next/link";
import React from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import AuthShell from "@/components/gp/AuthShell";
import GComprobantesLogo from "@/components/gp/GComprobantesLogo";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="flex justify-center mb-7">
        <GComprobantesLogo size={44} theme="light" />
      </div>
      <div className="gp-empty" style={{ padding: "8px 0 0" }}>
        <div className="gp-empty-icon">
          <FileQuestion size={26} />
        </div>
        <div
          className="text-[44px] font-bold leading-none gp-font-head tabular-nums"
          style={{ color: "var(--gp-text-primary)", letterSpacing: "-0.03em" }}
        >
          404
        </div>
        <div className="gp-empty-title">No encontramos esta página</div>
        <div className="gp-empty-hint">Puede que el enlace esté mal escrito o que la página se haya movido.</div>
        <Link href="/" className="gp-btn gp-btn-primary mt-2">
          <ArrowLeft size={14} /> Volver a comprobantes
        </Link>
      </div>
      <p className="text-center text-[11px] mt-8" style={{ color: "var(--gp-text-muted)" }}>
        © {new Date().getFullYear()} Corporación Garnier
      </p>
    </AuthShell>
  );
}
