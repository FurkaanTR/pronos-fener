import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Joueurs() {
  const [joueurs, setJoueurs] = useState([]);
  const [nom, setNom] = useState("");
  const [statut, setStatut] = useState(null);

  const charger = () =>
    supabase.from("joueurs").select("*").order("prenom").then(({ data }) => setJoueurs(data || []));

  useEffect(() => { charger(); }, []);

  const ajouter = async () => {
    if (!nom.trim()) return;
    setStatut("Ajout…");
    const { error } = await supabase.from("joueurs").insert({ prenom: nom.trim() });
    if (error) setStatut("Erreur : " + error.message);
    else { setStatut("Joueur ajouté ✔"); setNom(""); charger(); }
  };

  const retirer = async (id, prenom) => {
    if (!confirm(`Retirer ${prenom} ? Ses pronos seront aussi supprimés.`)) return;
    const { error } = await supabase.from("joueurs").delete().eq("id", id);
    if (error) setStatut("Erreur : " + error.message);
    else { setStatut(`${prenom} retiré.`); charger(); }
  };

  return (
    <div style={S.page}>
      <h1 style={S.titre}>JOUEURS</h1>
      <a href="/" style={S.lien}>← retour</a>
      <div style={S.carte}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input style={S.input} value={nom} placeholder="Prénom du joueur"
            onChange={(e) => setNom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ajouter()} />
          <button style={S.btn} onClick={ajouter}>Ajouter</button>
        </div>
        {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
      </div>
      {joueurs.map((j) => (
        <div key={j.id} style={S.ligne}>
          <span style={S.nom}>{j.prenom}</span>
          <button style={S.btnRetirer} onClick={() => retirer(j.id, j.prenom)}>✕</button>
        </div>
      ))}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 8, maxWidth: 420 },
  input: { flex: 1, minWidth: 140, padding: "10px", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
  btn: { padding: "10px 20px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  ligne: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#182a52", border: "1px solid #263a6a", borderRadius: 12, padding: "12px 18px", marginTop: 10, maxWidth: 420 },
  nom: { fontWeight: 700, color: "#ffed00" },
  btnRetirer: { background: "transparent", border: "1px solid #4a3a5a", color: "#e88", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
};
