import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - Think Edge Dental",
  description: "Login to Think Edge Dental Suite",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Think Edge Dental
          </h1>
          <p className="text-sm text-slate-500">
            Platform manajemen klinik gigi modern
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
