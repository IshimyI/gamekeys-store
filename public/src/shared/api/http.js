export async function getJson(url) {
  const res = await fetch(url);
  return { ok: res.ok, status: res.status, data: await res.json() };
}

export async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}
