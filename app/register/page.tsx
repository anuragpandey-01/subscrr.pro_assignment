import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#F4F2EC] px-6 py-10 text-[#1A1712]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#7C766C]">
              Subscrr
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Take control of your subscriptions.
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#7C766C]">
              Create your account and start tracking every recurring payment
              in one place.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}