const posts = [
  {
    category: "Subscription Management",
    title: "Take control of your recurring spending",
    description:
      "A practical approach to understanding subscriptions, avoiding forgotten payments, and keeping monthly spending under control.",
    date: "Sep 12, 2026",
    readTime: "5 min read",
  },
  {
    category: "Personal Finance",
    title: "The hidden cost of small recurring payments",
    description:
      "Small monthly payments can quietly become a significant yearly expense. Here's how to find the subscriptions eating into your budget.",
    date: "Sep 8, 2026",
    readTime: "4 min read",
  },
  {
    category: "AI & Finance",
    title: "How AI can make subscription tracking smarter",
    description:
      "From spending insights to upcoming payments, AI can turn subscription data into useful financial decisions.",
    date: "Sep 3, 2026",
    readTime: "6 min read",
  },
];

export default function Blog() {
  return (
    <section id="Blog" className="section">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#FF2500]">
              From the journal
            </p>

            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Ideas for spending
              <br />
              <span className="text-[#7C766C]">with intention.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-[#7C766C]">
            Practical thoughts on subscriptions, personal finance, privacy,
            and using technology to build better spending habits.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group flex min-h-[320px] flex-col rounded-[28px] border border-black/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FF2500]">
                  {post.category}
                </span>

                <span className="text-xs text-[#7C766C]">
                  {post.readTime}
                </span>
              </div>

              <div className="mt-10">
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.025em]">
                  {post.title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#7C766C]">
                  {post.description}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
                <span className="text-xs text-[#7C766C]">
                  {post.date}
                </span>

                <span className="text-sm font-medium transition group-hover:text-[#FF2500]">
                  Read article →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}