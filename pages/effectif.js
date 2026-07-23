import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

export default function Effectif() {
  const [liste, setListe] = useState([]);
  const [nom, setNom] = useState("");
  const [poste, setPoste] = useState("Attaquant");
  const [statut, setStatut] = useState(null);

  const charger = () =>
    supabase.from("effectif").select("*").order("poste").then(({ data }) => setListe(data || []));

  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    if (!nom.trim()) return;
    setStatut("Ajout…");
    const { error } = await supabase.from("effectif").insert({ nom: nom.trim(), poste });
    if (error) setStatut("Erreur : " + error.message);
    else { setStatut("Joueur ajouté ✔"); setNom(""); charger(); }
  };

  const changerPoste = async (id, nouveau) => {
    const { error } = await supabase.from("effectif").update({ poste: nouveau }).eq("id", id);
    if (!error) charger();
  };

  const retirer = async (id, n) => {
    if (!confirm(`Retirer ${n} de l'effectif ?`)) return;
    const { error } = await supabase.from("effectif").delete().eq("id", id);
    if (error) setStatut("Erreur : " + error.message);
    else { setStatut(`${n} retiré.`); charger(); }
  };

  return (
    <div style={S.page}>
      <h1 style={S.titre}>EFFECTIF</h1>
      <a href="/" style={S.lien}>← retour</a>
      <div style={S.carte}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input style={S.input} value={nom} placeholder="Nom du joueur"
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ajouter()} />
          <select style={S.select} value={poste} onChange={(e) => setPoste(e.target.value)}>
            {POSTES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button style={S.btn} onClick={ajouter}>Ajouter</button>
        </div>
        {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
      </div>
      {POSTES.map((p) => (
        <div key={p}>
          <div style={S.posteTitre}>{p}</div>
          {liste.filter((j) => j.poste === p).map((j) => (
            <div key={j.id} style={S.ligne}>
              <span style={S.nom}>{j.nom}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <select style={S.selectMini} value={j.poste}
                  onChange={(e) => changerPoste(j.id, e.target.value)}>
                  {POSTES.map((pp) => <option key={pp} value={pp}>{pp}</option>)}
                </select>
                <button style={S.btnRetirer} onClick={() => retirer(j.id, j.nom)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 8, maxWidth: 480 },
  input: { flex: 1, minWidth: 140, padding: "10px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
  select: { padding: "10px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
  selectMini: { padding: "5px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 6, color: "#fff", fontSize: 13 },
  btn: { padding: "10px 20px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  posteTitre: { fontWeight: 700, color: "#ffed00", marginTop: 20, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 14 },
  ligne: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#182a52", border: "1px solid #263a6a", borderRadius: 12, padding: "10px 16px", marginTop: 8, maxWidth: 480 },
  nom: { fontWeight: 600 },
  btnRetirer: { background: "transparent", border: "1px solid #4a3a5a", color: "#e88", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
};
