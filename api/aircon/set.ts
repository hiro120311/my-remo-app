import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { applianceId } = req.query;
  const token = process.env.REMO_TOKEN;
  if (!token) return res.status(500).json({ error: 'No REMO_TOKEN' });
  if (!applianceId || Array.isArray(applianceId)) return res.status(400).json({ error: 'Invalid applianceId' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 送られてくるJSONボディを受け取る
    const settings = req.body;

    // bodyをapplication/x-www-form-urlencoded形式に変換
    const bodyParams = new URLSearchParams();
    if (settings.temp !== undefined) bodyParams.append('temperature', settings.temp.toString());
    if (settings.mode !== undefined) bodyParams.append('operation_mode', settings.mode);
    if (settings.vol !== undefined) bodyParams.append('air_volume', settings.vol);
    if (settings.dir !== undefined) bodyParams.append('air_direction', settings.dir);
    if (settings.button !== undefined) bodyParams.append('button', settings.button);
    if (settings.temp_unit !== undefined) bodyParams.append('temperature_unit', settings.temp_unit);

    const response = await fetch(`https://api.nature.global/1/appliances/${applianceId}/aircon_settings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to set aircon settings' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
