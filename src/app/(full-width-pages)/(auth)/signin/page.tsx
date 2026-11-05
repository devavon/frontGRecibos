import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión — GComprobantes Garnier",
  description: "Gestión de comprobantes de pago — Corporación Garnier",
};

export default function SignIn() {
  return <SignInForm />;
}
