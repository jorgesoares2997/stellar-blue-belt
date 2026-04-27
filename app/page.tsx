export default function Home() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm uppercase tracking-widest text-blue-300">
          Welcome to StudyGroup DAO
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Decentralized coordination for study communities on Stellar
        </h1>
        <p className="max-w-3xl text-zinc-300">
          StudyGroup DAO is an MVP that helps members vote on next topics,
          collect and allocate funds for shared tools, and claim on-chain
          achievement certificates. All operations are designed to run through
          Freighter and execute on Stellar Testnet.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">Governance (Polls)</h2>
          <p className="text-sm text-zinc-300">
            Propose study topics and vote transparently with wallet-signed
            actions.
          </p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">Treasury</h2>
          <p className="text-sm text-zinc-300">
            Track contributions and manage shared expenses for courses and tools.
          </p>
        </article>
        <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-2 text-lg font-semibold">My Certificates (NFTs)</h2>
          <p className="text-sm text-zinc-300">
            Mint completion certificates as verifiable on-chain achievements.
          </p>
        </article>
      </section>
    </div>
  );
}
