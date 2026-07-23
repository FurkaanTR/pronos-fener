import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Resultat() {
  const [matchs, setMatchs] = useState([]);
  const [effectif, setEffectif] = useState([]);

  useEffect(() => {
    supabase.from("matchs").select("*").order("coup_denvoi").then(({ data }) => setMatchs(data || []));
    supabase.from("effectif").select("nom, poste").order("poste").then(({ data }) => setEffectif(data || []));
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.titre}>SAISIR UN RÉSULTAT</h1>
      <a href="/" style={S.lien}>← retour</a>
      {matchs.map((m) => <ResCard key={m.id} match={m} effectif={effectif} />)}
    </div>
  );
}

function ResCard({ match, effectif }) {
  const fenerDom = match.domicile === "Fenerbahçe";
  const estFener = fenerDom || match.exterieur === "Fenerbahçe";
  const [dom, setDom] = useState(match.score_domicile != null ? String(match.score_domicile) : "");
  const [ext, setExt] = useState(match.score_exterieur != null ? String(match.score_exterieur) : "");
  const [buteurs, setButeurs] = useState(match.buteurs_fener || []);
  const [statut, setStatut] = useState(null);

  const butsFener = parseInt(fenerDom ? dom : ext, 10) || 0;
  const setBut = (i, v) => setButeurs((b) => { const c = [...b]; c[i] = v; return c; });

  const enregistrer = async () => {
    setStatut("Enregistrement…");
    const { error } = await supabase.from("matchs").update({
      score_domicile: parseInt(dom, 10),
      score_exterieur: parseInt(ext, 10),
      buteurs_fener: estFener ? buteurs.slice(0, butsFener).filter(Boolean) : [],
      termine: true,
      resultat_confirme: true,
    }).eq("id", match.id);
    setStatut(error ? "Erreur : " + error.message : "Résultat enregistré ✔");
  };

  return (
    <div style={S.carte}>
      <div style={S.mt}>
        <span style={fenerDom ? S.f : undefined}>{match.domicile}</span>
        <span style={S.vs}> vs </span>
        <span style={!fenerDom ? S.f : undefined}>{match.exterieur}</span>
        {match.termine && <span style={S.badge}>terminé</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <input style={S.mini} inputMode="numeric" value={dom} onChange={(e) => setDom(e.target.value.replace(/\D/g,""))} />
        <span style={S.vs}>–</span>
        <input style={S.mini} inputMode="numeric" value={ext} onChange={(e) => setExt(e.target.value.replace(/\D/g,""))} />
      </div>
      {estFener && Array.from({ length: butsFener }).map((_, i) => (
        <select key={i} style={S.select} value={buteurs[i] || ""} onChange={(e) => setBut(i, e.target.value)}>
          <option value="">Buteur {i + 1}…</option>
          {effectif.map((p) => <option key={p.nom} value={p.nom}>{p.nom} ({p.poste[0]})</option>)}
        </select>
      ))}
      <button style={S.btn} onClick={enregistrer}>Enregistrer le résultat</button>
      {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 16 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 16 },
  mt: { fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 },
  f: { color: "#ffed00" },
  vs: { color: "#7b8cba", fontWeight: 400 },
  badge: { marginLeft: "auto", fontSize: 11, color: "#1f7a4d", border: "1px solid #1f7a4d", borderRadius: 6, padding: "2px 6px" },
  mini: { width: 52, padding: "8px 6px", textAlign: "center", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 16 },
  select: { width: "100%", padding: "8px", marginBottom: 6, background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
  btn: { marginTop: 10, padding: "12px 20px", background: "#1f7a4d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
};
