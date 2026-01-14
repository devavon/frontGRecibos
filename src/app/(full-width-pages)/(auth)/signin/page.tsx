import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | GRecibos - Garnier y Garnier",
  description: "Gestión de comprobantes de pago - Garnier y Garnier",
};

export default function SignIn() {
  return <SignInForm />;
}
