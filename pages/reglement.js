export default function Reglement() {
  return (
    <div style={S.page}>
      <h1 style={S.titre}>RÈGLEMENT</h1>
      <a href="/" style={S.lien}>← retour</a>

      <div style={S.carte}>
        <div style={S.section}>Pronostic d'un match</div>
        <div style={S.ligne}><span>Score exact</span><span style={S.pts}>5 pts</span></div>
        <div style={S.ligne}><span>Bon vainqueur + bon écart de buts</span><span style={S.pts}>3 pts</span></div>
        <div style={S.ligne}><span>Bon résultat seul (vainqueur ou nul)</span><span style={S.pts}>1 pt</span></div>
      </div>

      <div style={S.carte}>
        <div style={S.section}>Buteurs (Fenerbahçe uniquement)</div>
        <p style={S.note}>
          Tu proposes autant de buteurs que de buts annoncés pour Fener. Chaque buteur
          correct rapporte selon son poste. Un doublé cité deux fois compte deux fois.
        </p>
        <div style={S.ligne}><span>But d'un gardien</span><span style={S.pts}>5 pts</span></div>
        <div style={S.ligne}><span>But d'un défenseur</span><span style={S.pts}>3 pts</span></div>
        <div style={S.ligne}><span>But d'un milieu</span><span style={S.pts}>2 pts</span></div>
        <div style={S.ligne}><span>But d'un attaquant</span><span style={S.pts}>1 pt</span></div>
        <p style={S.note}>
          Les buts contre son camp et les buteurs adverses ne comptent pour personne.
        </p>
      </div>

      <div style={S.carte}>
        <div style={S.section}>Pronostics de saison</div>
        <p style={S.note}>
          Pour chacune des 8 compétitions (Ligue 1, Premier League, Liga, Serie A,
          Bundesliga, Süper Lig, Ligue des Champions, Ligue Europa), tu pronostiques le
          vainqueur, le meilleur buteur et le meilleur passeur.
        </p>
        <div style={S.ligne}><span>Chaque bonne réponse</span><span style={S.pts}>15 pts</span></div>
        <p style={S.note}>
          Modifiables jusqu'au 31 août, puis figés pour toute la saison.
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { fontFamily: "sans-serif", padding: 24, background: "#0d1b3e", color: "#eef2ff", minHeight: "100vh" },
  titre: { color: "#ffed00", fontStyle: "italic", letterSpacing: "0.1em", textAlign: "center" },
  lien: { display: "inline-block", padding: "10px 16px", background: "#182a52", border: "1px solid #2a3d6b", borderRadius: 10, color: "#ffed00", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 12 },
  carte: { background: "#182a52", border: "1px solid #263a6a", borderRadius: 16, padding: 18, marginTop: 16, maxWidth: 520 },
  section: { fontWeight: 800, color: "#ffed00", fontSize: 16, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" },
  ligne: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #223357" },
  pts: { fontWeight: 800, color: "#ffed00", whiteSpace: "nowrap", marginLeft: 16 },
  note: { color: "#9fb0d8", fontSize: 13, lineHeight: 1.5 },
};
