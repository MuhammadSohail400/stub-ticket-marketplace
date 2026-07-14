export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Sign up</h1>
      <p className="text-sm text-muted mb-8">
        Auth wiring (NextAuth.js) lands in Phase 2 — this is the visual shell.
      </p>
      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Full name</span>
          <input type="text" className="input" placeholder="Your name" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Email</span>
          <input type="email" className="input" placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-stub uppercase tracking-wide text-muted">Password</span>
          <input type="password" className="input" placeholder="••••••••" />
        </label>
        <button
          type="submit"
          className="mt-2 font-semibold bg-ink text-paper rounded-md px-6 py-3 hover:bg-stamp hover:text-ink transition-colors"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
