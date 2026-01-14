/* import SignInForm from "@/components/auth/SignInForm"; // Ajusta la ruta si es necesario

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  );
} */

  import SignInForm from "@/components/auth/SignInForm"; 

export default function LoginPage() {
  return (
    // Este div asegura que el login ocupe toda la pantalla y esté centrado
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6">
        <SignInForm />
      </div>
    </div>
  );
}