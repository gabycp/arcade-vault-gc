import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GamePlayer } from "@/app/components/game-player";
import { GAMES } from "@/app/data/games";

type Params = PageProps<"/juegos/[id]/jugar">["params"];

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default function PlayPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense
      fallback={
        <div className="pixel p-20 text-center text-xs text-[var(--ink-faint)]">
          CARGANDO…
        </div>
      }
    >
      <Player params={params} />
    </Suspense>
  );
}

async function Player({ params }: { params: Params }) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
