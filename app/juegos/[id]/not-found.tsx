import Link from "next/link";

export default function GameNotFound() {
  return (
    <div className="fade-in px-8 py-24 text-center">
      <div className="pixel neon-magenta mb-4 text-2xl">404</div>
      <div className="pixel mb-3 text-sm text-cyan">JUEGO NO ENCONTRADO</div>
      <p className="mb-8 text-[var(--ink-dim)]">
        Este cartucho no existe en el Vault.
      </p>
      <Link href="/" className="btn">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
