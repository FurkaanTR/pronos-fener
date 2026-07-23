export default async function handler(req, res) {
  try {
    const r = await fetch("https://v3.football.api-sports.io/teams?search=Fenerbahce", {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    const data = await r.json();
    // On renvoie juste les infos utiles : nom + id de chaque équipe trouvée
    const equipes = (data.response || []).map((e) => ({
      id: e.team.id,
      nom: e.team.name,
      pays: e.team.country,
    }));
    res.status(200).json({ equipes });
  } catch (e) {
    res.status(500).json({ erreur: e.message });
  }
}
