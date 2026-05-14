// /api/glpi.js — proxy CORS para o endpoint público do utilsdashboards
// Uso: /api/glpi?token=XXX  ou  /api/glpi?url=URL_COMPLETA

export default async function handler(req, res) {
  // Header CORS — libera chamada do navegador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token, url } = req.query;

  let target;
  if (url) {
    // Aceita URL completa, mas valida domínio para evitar SSRF aberto
    try {
      const u = new URL(url);
      if (u.hostname !== 'avenida.verdanadesk.com') {
        return res.status(400).json({ error: 'Domínio não permitido: ' + u.hostname });
      }
      target = url;
    } catch (e) {
      return res.status(400).json({ error: 'URL inválida' });
    }
  } else if (token) {
    if (!/^[a-f0-9]{32}$/i.test(token)) {
      return res.status(400).json({ error: 'Token inválido (esperado 32 hex chars)' });
    }
    target = `https://avenida.verdanadesk.com/plugins/utilsdashboards/front/ajax/graphic.json.php?token=${token}`;
  } else {
    return res.status(400).json({ error: 'Informe ?token=... ou ?url=...' });
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Vercel-Proxy)',
        'Accept': 'application/json'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `GLPI respondeu ${upstream.status}`,
        upstream_status: upstream.status
      });
    }

    const text = await upstream.text();

    // Tenta parsear como JSON; se vier outra coisa, devolve como texto
    try {
      const data = JSON.parse(text);
      res.setHeader('Cache-Control', 'public, max-age=60'); // cache 1min
      return res.status(200).json(data);
    } catch (e) {
      return res.status(502).json({
        error: 'Resposta não é JSON válido',
        body_preview: text.slice(0, 500)
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao consultar GLPI: ' + err.message });
  }
}
