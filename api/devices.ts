import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.REMO_TOKEN;
  if (!token) return res.status(500).json({ error: 'No REMO_TOKEN' });

  try {
    const response = await fetch('https://api.nature.global/1/devices', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch devices' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
