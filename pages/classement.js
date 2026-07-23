import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Barème
const B = { scoreExact: 5, vainqueurEcart: 3, resultatSeul: 1,
  poste: { Gardien: 5, Défenseur: 3, Milieu: 2, Attaquant: 1 } };

function pointsResultat(pd, pe, rd, re) {
  if (pd == null || pe == null) return 0;
  if (pd === rd && pe === re) return B.scoreExact;
  const signe = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  if (signe(pd, pe) !== signe(rd, re)) return 0;
  if (pd - pe === rd - re) return B.vainqueurEcart;
  return B.resultatSeul;
}

function pointsButeurs(prono, reel, posteMap) {
  const reste = [...(reel || [])];
  let pts = 0;
  for (const nom of (prono || [])) {
    const i = reste.indexOf(nom);
    if (i !== -1) { reste.splice(i, 1); pts += B.poste[posteMap[nom]] || 0; }
  }
  return pts;
}

export default function Classement() {
  const [lignes, setLignes] = useState([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: joueurs }, { data: matchs }, { data: pronos }, { data: effectif }] =
        await Promise.all([
          supabase.from("joueurs").select("*"),
          supabase.from("matchs").select("*").eq("termine", true),
          supabase.from("pronos_match").select("*"),
          supabase.from("effectif").select("nom, poste"),
        ]);

      const posteMap = {};
      (effectif || []).forEach((p) => (posteMap[p.nom] = p.poste));

      const totaux = {};
      (joueurs || []).forEach((j) => (totaux[j.id] = { prenom: j.prenom, total: 0 }));

      (matchs || []).forEach((m) => {
        const fenerDom = m.domicile === "Fenerbahçe";
        (pronos || []).filter((p) => p.match_id === m.id).forEach((p) => {
          const ptsR = pointsResultat(p.score_domicile, p.score_exterieur, m.score_domicile, m.score_exterieur);
          const ptsB = fenerDom || m.exterieur === "Fenerbahçe"
            ? pointsButeurs(p.buteurs, m.buteurs_fener, posteMap) : 0;
          if (totaux[p.joueur_id]) totaux[p.joueur_id].total += ptsR + ptsB;
        });
      });

      setLignes(Object.values(totaux).sort((a, b) => b.total - a.total));
      setPret(true);
    })();
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.titre}>CLASSEMENT</h1>
      <a href="/" style={S.lien}>← retour aux pronos</a>
      {!pret && <p style={{ color: "#9fb0d8" }}>Calcul…</p>}
      {pret && lignes.map((l, i) => (
        <div key={i} style={{ ...S.ligne, ...(i === 0 ? S.leader : {}) }}>
          <span style={S.rang}>{i + 1}</span>
          <span style={S.nom}>{i === 0 ? "★ " : ""}{l.prenom}</span>
          <span style={S.pts}>{l.total} pts</span>
        </div>
      ))}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 16 },
  ligne: { display: "flex", alignItems: "center", gap: 14, background: "#182a52", border: "1px solid #263a6a", borderRadius: 12, padding: "14px 18px", marginTop: 10 },
  leader: { border: "2px solid #ffed00", background: "#1c2f5c" },
  rang: { color: "#7b8cba", fontWeight: 700, width: 20 },
  nom: { fontWeight: 700, color: "#ffed00" },
  pts: { marginLeft: "auto", fontWeight: 800, fontSize: 20 },
};
