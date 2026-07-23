import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [joueurs, setJoueurs] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    supabase
      .from("effectif")
      .select("nom, poste")
      .then(({ data, error }) => {
        if (error) setErreur(error.message);
        else setJoueurs(data || []);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" }}>
      <h1 style={{ color: "#ffed00" }}>Effectif Fenerbahçe</h1>
      {erreur && <p style={{ color: "#ff6b6b" }}>Erreur : {erreur}</p>}
      {!erreur && joueurs.length === 0 && <p>Chargement…</p>}
      <ul>
        {joueurs.map((j, i) => (
          <li key={i}>{j.nom} — {j.poste}</li>
        ))}
      </ul>
    </div>
  );
}
