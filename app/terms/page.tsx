export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F4F2EC] px-6 py-10 text-[#1A1712]">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-black/10 pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7C766C]">
            Subscrr
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-3 text-[#7C766C]">
            Please read these terms before using Subscrr.
          </p>
        </header>

        <section className="mt-10 space-y-8 rounded-[28px] bg-white p-6 sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold">
              Use of the service
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Subscrr provides tools for managing and monitoring recurring
              subscriptions. You agree to use the service responsibly and
              only for lawful purposes.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Account responsibility
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              You are responsible for maintaining the confidentiality of
              your account credentials and for activity performed through
              your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Subscription information
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              Subscription prices, billing dates, categories, and other
              information entered into Subscrr are provided by you.
              Subscrr is a tracking and management tool and does not
              process or control the actual charges made by subscription
              providers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Accuracy of information
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              You are responsible for keeping the subscription information
              in your account accurate and up to date.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Availability
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              We aim to keep Subscrr available and reliable, but the
              service may occasionally be unavailable because of
              maintenance, technical problems, or other circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              Changes to these terms
            </h2>

            <p className="mt-3 leading-7 text-[#7C766C]">
              These terms may be updated as Subscrr evolves. Continued
              use of the service after changes are published constitutes
              acceptance of the updated terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}