import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [entre, setEntre] = useState(false);
  useEffect(() => { if (sessionStorage.getItem("entre") === "1") setEntre(true); }, []);
  const [code, setCode] = useState("");
  const [msgErreur, setMsgErreur] = useState(null);
  const [joueurs, setJoueurs] = useState([]);
  const [moi, setMoi] = useState(null);
  useEffect(() => {
    const sauv = sessionStorage.getItem("moi");
    if (sauv) setMoi(JSON.parse(sauv));
  }, []);
  const [effectif, setEffectif] = useState([]);
  const [matchs, setMatchs] = useState([]);

  useEffect(() => {
    if (!entre) return;
    supabase.from("joueurs").select("id, prenom").then(({ data }) => setJoueurs(data || []));
    supabase.from("effectif").select("nom, poste").order("poste").then(({ data }) => setEffectif(data || []));
    supabase.from("matchs").select("*").order("coup_denvoi").then(({ data }) => setMatchs(data || []));
  }, [entre]);

  const verifier = async () => {
    setMsgErreur(null);
    const r = await fetch("/api/verifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (r.ok) { setEntre(true); sessionStorage.setItem("entre", "1"); }
    else setMsgErreur("Mot de passe incorrect.");
  };

  if (!entre) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS FENER</h1>
        <p style={S.sous}>Mot de passe</p>
        <input type="password" value={code} onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && verifier()} style={S.input} autoFocus />
        <button style={S.btn} onClick={verifier}>Entrer</button>
        {msgErreur && <p style={S.err}>{msgErreur}</p>}
      </div>
    );
  }

  if (!moi) {
    return (
      <div style={S.page}>
        <h1 style={S.titre}>PRONOS FENER</h1>
        <p style={S.sous}>Qui es-tu ?</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {joueurs.map((j) => (
           <button key={j.id} style={S.btn} onClick={() => { setMoi(j); sessionStorage.setItem("moi", JSON.stringify(j)); }}>{j.prenom}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.titre}>PRONOS FENER</h1>
      <p style={S.sous}>
        Salut {moi.prenom} 👋 <button style={S.lien} onClick={() => { setMoi(null); sessionStorage.removeItem("moi"); }}>(changer)</button>
      </p>
<div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <a href="/classement" style={S.lien}>🏆 Classement</a>
        <a href="/saison" style={S.lien}>📅 Pronos de saison</a>
        <a href="/resultat" style={S.lien}>✅ Saisir un résultat</a>
        <a href="/ajout-match" style={S.lien}>➕ Ajouter un match</a>
       <a href="/joueurs" style={S.lien}>👥 Joueurs</a>
        <a href="/effectif" style={S.lien}>⚽ Effectif</a>
      </div>
      {matchs.length === 0 && <p style={{ color: "#9fb0d8" }}>Aucun match pour l'instant.</p>}
      {matchs.map((m) => (
        <MatchCard key={m.id} match={m} moi={moi} effectif={effectif} />
      ))}
    </div>
  );
}

function MatchCard({ match, moi, effectif }) {
  const fenerDom = match.domicile === "Fenerbahçe";
  const [dom, setDom] = useState("");
  const [ext, setExt] = useState("");
  const [buteurs, setButeurs] = useState([]);
  const [statut, setStatut] = useState(null);

  useEffect(() => {
    supabase.from("pronos_match").select("*")
      .eq("joueur_id", moi.id).eq("match_id", match.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDom(String(data.score_domicile));
          setExt(String(data.score_exterieur));
          setButeurs(data.buteurs || []);
          setStatut("Prono déjà enregistré ✔");
        }
      });
  }, []);

  const butsFener = parseInt(fenerDom ? dom : ext, 10) || 0;
  const setBut = (i, val) => setButeurs((b) => { const c = [...b]; c[i] = val; return c; });

  const enregistrer = async () => {
    setStatut("Enregistrement…");
    const { error } = await supabase.from("pronos_match").upsert({
      joueur_id: moi.id,
      match_id: match.id,
      score_domicile: parseInt(dom, 10),
      score_exterieur: parseInt(ext, 10),
      buteurs: buteurs.slice(0, butsFener).filter(Boolean),
    }, { onConflict: "joueur_id,match_id" });
    setStatut(error ? "Erreur : " + error.message : "Prono enregistré ✔");
  };

  return (
    <div style={S.carte}>
     <div style={S.matchTitre}>
        <span style={fenerDom ? S.fener : undefined}>{match.domicile}</span>
        <span style={S.vs}> vs </span>
        <span style={!fenerDom ? S.fener : undefined}>{match.exterieur}</span>
        <span style={S.compet}>{match.competition}</span>
      </div>
      {match.coup_denvoi && (
        <div style={S.dateMatch}>
          {new Date(match.coup_denvoi).toLocaleString("fr-FR", {
            weekday: "long", day: "numeric", month: "long",
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <input style={S.mini} inputMode="numeric" placeholder={match.domicile.slice(0,3)}
          value={dom} onChange={(e) => setDom(e.target.value.replace(/\D/g, ""))} />
        <span style={S.vs}>–</span>
        <input style={S.mini} inputMode="numeric" placeholder={match.exterieur.slice(0,3)}
          value={ext} onChange={(e) => setExt(e.target.value.replace(/\D/g, ""))} />
      </div>
      {Array.from({ length: butsFener }).map((_, i) => (
        <select key={i} style={S.select} value={buteurs[i] || ""} onChange={(e) => setBut(i, e.target.value)}>
          <option value="">Buteur {i + 1}…</option>
          {effectif.map((p) => (
            <option key={p.nom} value={p.nom}>{p.nom} ({p.poste[0]})</option>
          ))}
        </select>
      ))}
      <button style={S.btnValider} onClick={enregistrer}>Enregistrer mon prono</button>
      {statut && <p style={{ color: "#9fb0d8", marginTop: 8 }}>{statut}</p>}
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em" },
  sous: { color: "#cdd7f0", fontSize: 18 },
  input: { display: "block", padding: "12px", fontSize: 16, borderRadius: 8, border: "1px solid #2a3d6b", background: "#0b1631", color: "#fff", marginBottom: 12, width: 220 },
  btn: { padding: "14px 28px", background: "#ffed00", color: "#0d1b3e", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  btnValider: { marginTop: 10, padding: "12px 20px", background: "#1f7a4d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" },
 lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14 },
  err: { color: "#ff6b6b", marginTop: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 16 },
  matchTitre: { fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  dateMatch: { color: "#9fb0d8", fontSize: 13, marginBottom: 12, marginTop: -6 },
  fener: { color: "#ffed00" },
  vs: { color: "#7b8cba", fontWeight: 400 },
  compet: { marginLeft: "auto", fontSize: 12, color: "#0d1b3e", background: "#ffed00", padding: "3px 8px", borderRadius: 6, fontWeight: 700 },
  mini: { width: 52, padding: "8px 6px", textAlign: "center", background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 16 },
  select: { width: "100%", padding: "8px", marginBottom: 6, background: "#0b1631", border: "1px solid #2a3d6b", borderRadius: 8, color: "#fff", fontSize: 14 },
};
