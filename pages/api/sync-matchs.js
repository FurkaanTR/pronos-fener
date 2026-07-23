import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

const FENER_ID = 611;

export default async function handler(req, res) {
  try {
    // Saison en cours ; ajuste si besoin. On prend les 20 prochains matchs.
    const url = `https://v3.football.api-sports.io/fixtures?team=${FENER_ID}&next=20`;
    const r = await fetch(url, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    const data = await r.json();
    const fixtures = data.response || [];

    let ajoutes = 0;
    for (const f of fixtures) {
      const dom = f.teams.home.name;
      const ext = f.teams.away.name;
      const compet = f.league.name;
      const coup = f.fixture.date;
      const apiId = f.fixture.id;

      // upsert par api_fixture_id pour éviter les doublons
      const { error } = await supabase.from("matchs").upsert(
        {
          api_fixture_id: apiId,
          domicile: dom,
          exterieur: ext,
          competition: compet,
          coup_denvoi: coup,
          type: "fener",
        },
        { onConflict: "api_fixture_id" }
      );
      if (!error) ajoutes++;
    }

    res.status(200).json({ recus: fixtures.length, traites: ajoutes });
  } catch (e) {
    res.status(500).json({ erreur: e.message });
  }
}
