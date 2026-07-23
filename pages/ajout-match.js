import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AjoutMatch() {
  const [dom, setDom] = useState("Fenerbahçe");
  const [ext, setExt] = useState("");
  const [compet, setCompet] = useState("Süper Lig");
  const [date, setDate] = useState("");
  const [statut, setStatut] = useState(null);

  const ajouter = async () => {
    if (!dom || !ext) { setStatut("Remplis les deux équipes."); return; }
    setStatut("Ajout…");
    const { error } = await supabase.from("matchs").insert({
      domicile: dom,
      exterieur: ext,
      competition: compet,
      coup_denvoi: date ? new Date(date).toISOString() : null,
      type: "fener",
    });
    if (error) setStatut("Erreur : " + error.message);
    else { setStatut("Match ajouté ✔"); setExt(""); setDate(""); }
  };

  return (
    <div style={S.page}>
      <h1 style={S.titre}>AJOUTER UN MATCH</h1>
      <a href="/" style={S.lien}>← retour</a>
      <div style={S.carte}>
        <label style={S.lab}>Domicile</label>
        <input style={S.input} value={dom} onChange={(e) => setDom(e.target.value)} />
        <label style={S.lab}>Extérieur</label>
        <input style={S.input} value={ext} onChange={(e) => setExt(e.target.value)} placeholder="Ex. Galatasaray" />
        <label style={S.lab}>Compétition</label>
        <input style={S.input} value={compet} onChange={(e) => setCompet(e.target.value)} />
        <label style={S.lab}>Date et heure du coup d'envoi</label>
        <input style={S.input} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <button style={S.btn} onClick={ajouter}>Ajouter le match</button>
        {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 8, maxWidth: 420 },
  lab: { display: "block", color: "#9fb0d8", fontSize: 13, marginTop: 12, marginBottom: 4 },
  input: { width: "100%", padding: "10px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" },
  btn: { marginTop: 16, padding: "12px 20px", background: "#1f7a4d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
};
