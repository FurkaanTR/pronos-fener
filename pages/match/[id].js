import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

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

export default function MatchDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);
  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: m } = await supabase.from("matchs").select("*").eq("id", id).maybeSingle();
      setMatch(m);
      const [{ data: joueurs }, { data: pronos }, { data: effectif }] = await Promise.all([
        supabase.from("joueurs").select("*"),
        supabase.from("pronos_match").select("*").eq("match_id", id),
        supabase.from("effectif").select("nom, poste"),
      ]);
      const posteMap = {};
      (effectif || []).forEach((p) => (posteMap[p.nom] = p.poste));
      const fenerDom = m && m.domicile === "Fenerbahçe";
      const estFener = m && (fenerDom || m.exterieur === "Fenerbahçe");

      const res = (pronos || []).map((p) => {
        const joueur = (joueurs || []).find((j) => j.id === p.joueur_id);
        const ptsR = pointsResultat(p.score_domicile, p.score_exterieur, m.score_domicile, m.score_exterieur);
        const ptsB = estFener ? pointsButeurs(p.buteurs, m.buteurs_fener, posteMap) : 0;
        return {
          prenom: joueur ? joueur.prenom : "?",
          score: `${p.score_domicile} – ${p.score_exterieur}`,
          buteurs: p.buteurs || [],
          total: ptsR + ptsB,
        };
      }).sort((a, b) => b.total - a.total);

      setLignes(res);
    })();
  }, [id]);

  if (!match) return <div style={S.page}><a href="/passes" style={S.lien}>← retour</a><p style={{color:"#9fb0d8"}}>Chargement…</p></div>;

  const aScore = match.score_domicile != null;
  const medaille = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}e`);

  return (
    <div style={S.page}>
      <a href="/passes" style={S.lien}>← retour</a>
      <div style={S.entete}>
        <div style={S.titreMatch}>{match.domicile} {aScore ? `${match.score_domicile} – ${match.score_exterieur}` : "vs"} {match.exterieur}</div>
        {aScore && match.buteurs_fener && match.buteurs_fener.length > 0 && (
          <div style={S.buteursReels}>⚽ {match.buteurs_fener.join(", ")}</div>
        )}
      </div>
      {!aScore && <p style={{ color: "#ffb84d" }}>Résultat pas encore saisi — classement disponible après.</p>}
      {lignes.length === 0 && <p style={{ color: "#9fb0d8" }}>Personne n'a pronostiqué ce match.</p>}
      {lignes.map((l, i) => (
        <div key={i} style={{ ...S.carte, ...(i === 0 ? S.leader : {}) }}>
          <div style={S.ligneHaut}>
            <span style={S.rang}>{medaille(i)}</span>
            <span style={S.prenom}>{l.prenom}</span>
            <span style={S.pts}>{l.total} pts</span>
          </div>
          <div style={S.detail}>
            Prono : {l.score}
            {l.buteurs.length > 0 && <> · Buteurs : {l.buteurs.join(", ")}</>}
          </div>
        </div>
      ))}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  entete: { marginBottom: 16 },
  titreMatch: { fontWeight: 800, fontSize: 20, color: "#ffed00" },
  buteursReels: { color: "#cdd7f0", fontSize: 14, marginTop: 6 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 12, padding: "12px 16px", marginTop: 10 },
  leader: { border: "2px solid #ffed00", background: "#1c2f5c" },
  ligneHaut: { display: "flex", alignItems: "center", gap: 12 },
  rang: { fontSize: 20, minWidth: 34 },
  prenom: { fontWeight: 700, color: "#ffed00" },
  pts: { marginLeft: "auto", fontWeight: 800, fontSize: 18 },
  detail: { color: "#9fb0d8", fontSize: 13, marginTop: 6 },
};
