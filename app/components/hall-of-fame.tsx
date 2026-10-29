"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES } from "@/app/data/games";
import { SCORES } from "@/app/data/scores";
import type { SavedScore } from "@/app/data/types";
import { useSession } from "./session-provider";

const SCORES_KEY = "av_scores";

function readSavedScores(): SavedScore[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedScore[]) : [];
  } catch {
    // localStorage bloqueado o JSON corrupto: sin marcas guardadas.
    return [];
  }
}

function formatDate(at: number): string {
  const d = new Date(at);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function HallOfFame() {
  const { user } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);
  const [saved, setSaved] = useState<SavedScore[]>([]);

  // Se lee tras montar (y al volver a la ruta) para no desajustar la hidratación.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readSavedScores());
  }, []);

  const rows = SCORES[tab];
  const game = GAMES.find((g) => g.id === tab)!;

  const mine = user
    ? saved
        .filter((s) => s.game === tab && s.name === user.name)
        .reduce<SavedScore | null>(
          (best, s) => (!best || s.score > best.score ? s : best),
          null,
        )
    : null;
  const youRank = mine ? rows.filter((r) => r.score > mine.score).length + 1 : null;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel text-[10px]">
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className={"chip" + (tab === g.id ? " active" : "")}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{rows[1].name}</div>
          <div className="score">{rows[1].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[1].date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel text-[9px] tracking-[0.18em] text-gold">CAMPEÓN</div>
          <div className="rank-num mt-1 !text-[36px]">01</div>
          <div className="name">{rows[0].name}</div>
          <div className="score !text-[20px]">{rows[0].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[0].date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{rows[2].name}</div>
          <div className="score">{rows[2].score.toLocaleString("es-ES")}</div>
          <div className="date">{rows[2].date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={`${tab}-${r.rank}`}
            className={
              "tr" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")
            }
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{pad(r.rank)}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div
              key={`${tab}-you`}
              className="tr you"
              style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
            >
              {mine && youRank !== null ? (
                <>
                  <div className="rk !text-yellow">#{pad(youRank)}</div>
                  <div className="pl !text-yellow">{user.name}</div>
                  <div className="sc !text-yellow ![text-shadow:0_0_6px_rgba(245,255,0,0.5)]">
                    {mine.score.toLocaleString("es-ES")}
                  </div>
                  <div className="dt">{formatDate(mine.at)}</div>
                </>
              ) : (
                <>
                  <div className="rk !text-yellow">—</div>
                  <div className="pl !text-yellow">{user.name}</div>
                  <div className="sc !text-yellow ![text-shadow:0_0_6px_rgba(245,255,0,0.5)]">
                    SIN MARCA AÚN
                  </div>
                  <div className="dt">—</div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
