export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-lg">STUB</p>
          <p className="text-sm text-muted mt-1">
            Peer-to-peer ticket resale. Every ticket, verified hand to hand.
          </p>
        </div>
        <p className="text-xs font-stub text-muted uppercase tracking-widest">
          © 2026 Stub Marketplace — Portfolio Build
        </p>
      </div>
    </footer>
  );
}
