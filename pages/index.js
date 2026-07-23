import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [joueurs, setJoueurs] = useState([]);
  const [moi, setMoi] = useState(null);
  const [effectif, setEffectif] = useState([]);
  const [erreur, setErreur] = useState(null);

  // Charger la liste des joueurs et l'effectif au démarrage
  useEffect(() => {
    supabase.from("joueurs").select("id, prenom").then(({ data, error }) => {
      if (error) setErreur(error.message);
      else setJoueurs(data || []);
    });
    supabase.from("effectif").select("nom, poste").then(({ data }) => {
      setEffectif(data || []);
    });
  }, []);

  // Écran 1 : choisir son joueur
  if (!moi) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS FENER</h1>
        <p style={S.sous}>Qui es-tu ?</p>
        {erreur && <p style={S.err}>Erreur : {erreur}</p>}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {joueurs.map((j) => (
            <button key={j.id} style={S.btn} onClick={() => setMoi(j)}>
              {j.prenom}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Écran 2 : connecté
  return (
    <div style={S.page}>
      <h1 style={S.titre}>PRONOS FENER</h1>
      <p style={S.sous}>
        Salut {moi.prenom} 👋{" "}
        <button style={S.lien} onClick={() => setMoi(null)}>
          (changer)
        </button>
      </p>
      <p style={{ color: "#9fb0d8" }}>
        Connexion OK. Effectif chargé : {effectif.length} joueurs. La suite (pronos) arrive
        à la prochaine brique.
      </p>
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  sous: { color: "#cdd7f0", fontSize: 18 },
  btn: { padding: "14px 28px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  lien: { background: "none", border: "none", color: "#9fb0d8", textDecoration: "underline", cursor: "pointer", fontSize: 14 },
  err: { color: "#ff6b6b" },
};
