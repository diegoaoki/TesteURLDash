export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { org, path } = req.query;

  if (!org || !path) {
    return res.status(400).json({ error: 'Parâmetros org e path são obrigatórios.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header ausente.' });
  }

  const azurePath = Array.isArray(path) ? path.join('/') : path;
  const queryParams = { ...req.query };
  delete queryParams.org;
  delete queryParams.path;
  const qs = new URLSearchParams(queryParams).toString();
  const targetUrl = `https://dev.azure.com/${org}/${azurePath}${qs ? '?' + qs : ''}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro no proxy: ' + err.message });
  }
}
