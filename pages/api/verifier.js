export default function handler(req, res) {
  const { code } = req.body;
  if (code === process.env.MOT_DE_PASSE) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}
