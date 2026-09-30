export const config = { maxDuration: 60 };

const ACTIONS = ['generate-media', 'convert-media', 'translate-prompt'];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method not allowed' });
  }

  let body: any = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ success: false, error: 'bad json' });
  }
  if (!ACTIONS.includes(body.action)) {
    return res.status(400).json({ success: false, error: 'invalid action' });
  }

  try {
    const r = await fetch(process.env.STUDIO_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.STUDIO_API_KEY as string,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000),
    });
    const data = await r.json().catch(() => ({ success: false, error: 'bad upstream response' }));
    return res.status(r.status).json(data);
  } catch {
    return res.status(504).json({ success: false, error: 'upstream timeout' });
  }
}
