import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

function LoginPageContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F4F2EC] px-6">
          <div className="text-sm text-[#7C766C]">Loading...</div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}