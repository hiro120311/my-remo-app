import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { signalId } = req.query;
  const token = process.env.REMO_TOKEN;
  if (!token) return res.status(500).json({ error: 'No REMO_TOKEN' });
  if (!signalId || Array.isArray(signalId)) return res.status(400).json({ error: 'Invalid signalId' });

  try {
    const response = await fetch(`https://api.nature.global/1/signals/${signalId}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to send signal' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
