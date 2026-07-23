export default function handler(req, res) {
  const { code } = req.body;
  if (code === process.env.CODE_ADMIN) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}
