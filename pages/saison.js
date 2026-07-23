import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const COMPETS = ["Ligue 1","Premier League","Liga","Serie A","Bundesliga","Süper Lig","Ligue des Champions","Ligue Europa"];
const CATS = ["Vainqueur","Meilleur buteur","Meilleur passeur"];

export default function Saison() {
  const [joueurs, setJoueurs] = useState([]);
  const [moi, setMoi] = useState(null);
  const [reponses, setReponses] = useState({});
  const [gel, setGel] = useState(null);
  const [statut, setStatut] = useState(null);

  useEffect(() => {
    supabase.from("joueurs").select("*").then(({ data }) => setJoueurs(data || []));
    supabase.from("reglages").select("*").eq("cle", "gel_pronos_saison").maybeSingle()
      .then(({ data }) => setGel(data ? new Date(data.valeur) : null));
  }, []);

  useEffect(() => {
    if (!moi) return;
    supabase.from("pronos_saison").select("*").eq("joueur_id", moi.id).then(({ data }) => {
      const r = {};
      (data || []).forEach((p) => (r[`${p.competition}|${p.categorie}`] = p.reponse));
      setReponses(r);
    });
  }, [moi]);

  const estGele = gel && new Date() > gel;

  const set = (compet, cat, val) => setReponses((r) => ({ ...r, [`${compet}|${cat}`]: val }));

  const enregistrer = async () => {
    setStatut("Enregistrement…");
    const lignes = [];
    COMPETS.forEach((c) => CATS.forEach((cat) => {
      const rep = reponses[`${c}|${cat}`];
      if (rep) lignes.push({ joueur_id: moi.id, competition: c, categorie: cat, reponse: rep });
    }));
    const { error } = await supabase.from("pronos_saison").upsert(lignes, { onConflict: "joueur_id,competition,categorie" });
    setStatut(error ? "Erreur : " + error.message : "Pronos de saison enregistrés ✔");
  };

  if (!moi) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS DE SAISON</h1>
        <a href="/" style={S.lien}>← retour</a>
        <p style={S.sous}>Qui es-tu ?</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {joueurs.map((j) => <button key={j.id} style={S.btn} onClick={() => setMoi(j)}>{j.prenom}</button>)}
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.titre}>PRONOS DE SAISON</h1>
      <a href="/" style={S.lien}>← retour</a>
      <p style={S.sous}>{moi.prenom} — 15 pts par bonne réponse</p>
      {estGele
        ? <p style={{ color: "#ffb84d" }}>🔒 Pronos figés depuis le 31 août — lecture seule.</p>
        : <p style={{ color: "#9fb0d8" }}>Modifiable jusqu'au 31 août.</p>}
      {COMPETS.map((c) => (
        <div key={c} style={S.carte}>
          <div style={S.compet}>{c}</div>
          {CATS.map((cat) => (
            <div key={cat} style={S.ligne}>
              <span style={S.cat}>{cat}</span>
              <input style={S.input} disabled={estGele}
                value={reponses[`${c}|${cat}`] || ""}
                onChange={(e) => set(c, cat, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
      {!estGele && <button style={S.btnSave} onClick={enregistrer}>Enregistrer mes pronos</button>}
      {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { color: "#9fb0d8", display: "inline-block", marginBottom: 12 },
  sous: { color: "#cdd7f0", fontSize: 18 },
  btn: { padding: "14px 28px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 16, marginTop: 14 },
  compet: { fontWeight: 700, color: "#ffed00", marginBottom: 8 },
  ligne: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  cat: { flex: "0 0 130px", color: "#9fb0d8", fontSize: 13 },
  input: { flex: 1, minWidth: 120, padding: "8px 10px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
  btnSave: { marginTop: 16, padding: "14px 24px", background: "#1f7a4d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 },
};
