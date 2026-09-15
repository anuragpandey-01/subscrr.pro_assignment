export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F4F2EC] px-6 py-10 text-[#1A1712]">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-black/10 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7C766C]">
            Subscrr
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-[#7C766C]">
            Your privacy matters to us.
          </p>
        </header>

        <section className="mt-10 space-y-8 rounded-[28px] bg-white p-6 sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold">
              Information we collect
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Subscrr collects information required to create and manage
              your account, including your name, email address, and
              subscription information that you choose to add.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              How we use your information
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Your information is used to provide the subscription
              management features of Subscrr, including authentication,
              subscription tracking, spending calculations, and dashboard
              analytics.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Data security
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Passwords are stored as secure password hashes rather than
              plain text. Authentication is handled using secure
              HTTP-only cookies to reduce exposure of authentication
              tokens to client-side scripts.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Subscription data
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Subscription information is stored in the application
              database so that it can persist between sessions and be
              displayed in your dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Your responsibility
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Please keep your account credentials private and only add
              subscription information that you are comfortable storing
              in the application.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Contact
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              If you have questions about this privacy policy, please
              contact the Subscrr team.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}