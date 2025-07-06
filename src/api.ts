export async function fetchAppliances() {
  const res = await fetch('/api/appliances');
  if (!res.ok) throw new Error('API fetch error');
  return res.json();
}

export async function sendSignal(signalId: string) {
  const res = await fetch(`/api/signals/${signalId}/send`, { method: 'POST' });
  if (!res.ok) throw new Error('Signal send failed');
}

export async function setAirconSettings(applianceId: string, settings: any) {
  const res = await fetch(`/api/aircon/${applianceId}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Aircon set failed');
}
