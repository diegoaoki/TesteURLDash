# AzureBoard.dash — Deploy no Vercel

## Estrutura
```
azboard/
├── api/
│   └── proxy.js        ← função serverless (proxy para a API do Azure)
├── public/
│   └── index.html      ← dashboard
└── vercel.json         ← configuração de rotas
```

## Como fazer o deploy

### 1. Instale o Vercel CLI (se ainda não tiver)
```bash
npm install -g vercel
```

### 2. Faça login
```bash
vercel login
```

### 3. Na pasta do projeto, rode:
```bash
vercel deploy --prod
```

### 4. Acesse a URL gerada pelo Vercel
Ex: `https://azboard-dash.vercel.app`

---

## Como usar o dashboard

1. Preencha **Organização** com apenas o nome (ex: `GrupoAvenida`, não a URL completa)
2. Preencha **Projeto** com o nome exato do projeto no Azure DevOps
3. Preencha **Time** (opcional)
4. Cole seu **Personal Access Token** (PAT) com permissão de leitura em Work Items
5. Clique em **Conectar**
6. Clique em **salvar** para não precisar preencher novamente

## Gerar o PAT

1. Acesse `dev.azure.com/{sua-organização}`
2. Perfil → User Settings → Personal Access Tokens
3. New Token → Scopes: **Work Items → Read**
4. Copie o token (aparece apenas uma vez)

## Segurança

- O PAT trafega apenas entre seu browser e a função serverless no Vercel
- A função serverless repassa a chamada ao Azure DevOps com o header de autorização
- O PAT salvo no "salvar" fica apenas no localStorage do seu browser
