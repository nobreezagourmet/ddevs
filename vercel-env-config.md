# Variáveis de Ambiente para Vercel

## Como configurar no painel da Vercel:

1. Acesse o dashboard da Vercel
2. Selecione seu projeto
3. Vá para "Settings" → "Environment Variables"
4. Adicione as seguintes variáveis:

### Variáveis Necessárias:

```
NEXT_PUBLIC_API_URL=https://ddevs-86w2.onrender.com
```

### Para uso no código frontend:

```javascript
// Em arquivos .js ou .jsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ddevs-86w2.onrender.com';

// Em arquivos HTML (se necessário)
<script>
    const API_URL = 'https://ddevs-86w2.onrender.com';
</script>
```

### Variáveis Opcionais (se usar backend na Vercel):

```
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=seu_secreto_jwt
NODE_ENV=production
```

## Importante:

- Variáveis que começam com `NEXT_PUBLIC_` ficam disponíveis no frontend
- Variáveis sem `NEXT_PUBLIC_` ficam apenas no backend
- Sempre faça deploy após alterar variáveis de ambiente
- Use o prefixo `NEXT_PUBLIC_` para variáveis que o frontend precisa acessar
