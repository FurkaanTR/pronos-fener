import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Passes() {
  const [matchs, setMatchs] = useState([]);

  useEffect(() => {
    supabase.from("matchs").select("*").order("coup_denvoi", { ascending: false })
      .then(({ data }) => setMatchs(data || []));
  }, []);

  const limite = Date.now() - 24 * 60 * 60 * 1000;
  const passes = matchs.filter(
    (m) => m.coup_denvoi && new Date(m.coup_denvoi).getTime() <= limite
  );

  return (
    <div style={S.page}>
      <h1 style={S.titre}>MATCHS PASSÉS</h1>
      <a href="/" style={S.lien}>← retour</a>
      {passes.length === 0 && <p style={{ color: "#9fb0d8" }}>Aucun match passé pour l'instant.</p>}
      {passes.map((m) => {
        const fenerDom = m.domicile === "Fenerbahçe";
        const aScore = m.score_domicile != null && m.score_exterieur != null;
        return (
          <div key={m.id} style={S.carte}>
            <div style={S.mt}>
              <span style={fenerDom ? S.f : undefined}>{m.domicile}</span>
              {aScore
                ? <span style={S.score}>{m.score_domicile} – {m.score_exterieur}</span>
                : <span style={S.vs}> vs </span>}
              <span style={!fenerDom ? S.f : undefined}>{m.exterieur}</span>
              <span style={S.compet}>{m.competition}</span>
            </div>
            {m.coup_denvoi && (
              <div style={S.date}>
                {new Date(m.coup_denvoi).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            )}
            {aScore && m.buteurs_fener && m.buteurs_fener.length > 0 && (
              <div style={S.buteurs}>⚽ {m.buteurs_fener.join(", ")}</div>
            )}
            {!aScore && <div style={S.enAttente}>Résultat pas encore saisi</div>}
          </div>
        );
      })}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 16, marginTop: 12 },
  mt: { fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  f: { color: "#ffed00" },
  vs: { color: "#7b8cba", fontWeight: 400 },
  score: { fontWeight: 800, color: "#fff", fontSize: 18 },
  compet: { marginLeft: "auto", fontSize: 12, color: "#0d1b3e", background: "#ffed00", padding: "3px 8px", borderRadius: 6, fontWeight: 700 },
  date: { color: "#9fb0d8", fontSize: 13, marginTop: 6, textTransform: "capitalize" },
  buteurs: { color: "#cdd7f0", fontSize: 14, marginTop: 8 },
  enAttente: { color: "#ffb84d", fontSize: 13, marginTop: 8 },
};
