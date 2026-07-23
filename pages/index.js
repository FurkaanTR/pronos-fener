import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [entre, setEntre] = useState(false);
  const [code, setCode] = useState("");
  const [msgErreur, setMsgErreur] = useState(null);

  const [joueurs, setJoueurs] = useState([]);
  const [moi, setMoi] = useState(null);
  const [effectif, setEffectif] = useState([]);

  useEffect(() => {
    if (!entre) return;
    supabase.from("joueurs").select("id, prenom").then(({ data }) => setJoueurs(data || []));
    supabase.from("effectif").select("nom, poste").then(({ data }) => setEffectif(data || []));
  }, [entre]);

  const verifier = async () => {
    setMsgErreur(null);
    const r = await fetch("/api/verifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (r.ok) setEntre(true);
    else setMsgErreur("Mot de passe incorrect.");
  };

  // Écran 0 : mot de passe
  if (!entre) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS FENER</h1>
        <p style={S.sous}>Mot de passe</p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && verifier()}
          style={S.input}
          autoFocus
        />
        <button style={S.btn} onClick={verifier}>Entrer</button>
        {msgErreur && <p style={S.err}>{msgErreur}</p>}
      </div>
    );
  }

  // Écran 1 : choisir son joueur
  if (!moi) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS FENER</h1>
        <p style={S.sous}>Qui es-tu ?</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {joueurs.map((j) => (
            <button key={j.id} style={S.btn} onClick={() => setMoi(j)}>{j.prenom}</button>
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
        <button style={S.lien} onClick={() => setMoi(null)}>(changer)</button>
      </p>
      <p style={{ color: "#9fb0d8" }}>
        Connecté. Effectif chargé : {effectif.length} joueurs. La suite (pronos) arrive à la prochaine brique.
      </p>
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  sous: { color: "#cdd7f0", fontSize: 18 },
  input: { display: "block", padding: "12px", fontSize: 16, borderRadius: 8, border: "1px solid #2a3d6b", background: "#0b1631", color: "#fff", marginBottom: 12, width: 220 },
  btn: { padding: "14px 28px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  lien: { background: "none", border: "none", color: "#9fb0d8", textDecoration: "underline", cursor: "pointer", fontSize: 14 },
  err: { color: "#ff6b6b", marginTop: 12 },
};
