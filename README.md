# WhatsApp Auto Responder Bot - Vercel Edition

Bot de WhatsApp serverless que responde automaticamente quando você não está disponível, hospedado na Vercel.

## 🚀 Funcionalidades

- ✅ Serverless na Vercel (sempre online)
- ✅ WhatsApp Business API integration
- ✅ Resposta automática apenas uma vez por conversa
- ✅ Desativa automaticamente quando o dono responde
- ✅ Reativa após 30 minutos de inatividade do dono
- ✅ Sistema anti-spam (máximo 3 mensagens por minuto)
- ✅ APIs para configuração e monitoramento
- ✅ Webhook para receber mensagens em tempo real

## 📦 Deploy na Vercel

### 1. Configurar WhatsApp Business API

Primeiro, você precisa configurar a WhatsApp Business API:

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um app e configure WhatsApp Business API
3. Obtenha seu `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_ID`

### 2. Deploy no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pedrovergueiro/bot_whats_pai)

Ou manualmente:

```bash
# Clone o repositório
git clone https://github.com/pedrovergueiro/bot_whats_pai.git
cd bot_whats_pai

# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Configurar Variáveis de Ambiente

Na Vercel, configure estas variáveis:

```
WHATSAPP_TOKEN=seu_token_aqui
WHATSAPP_PHONE_ID=seu_phone_id_aqui
WEBHOOK_VERIFY_TOKEN=meu_token_secreto
```

### 4. Configurar Webhook

No painel do WhatsApp Business API, configure o webhook:

- **URL**: `https://seu-projeto.vercel.app/api/webhook`
- **Verify Token**: `meu_token_secreto`
- **Eventos**: `messages`

## ⚙️ Configurações

O bot possui as seguintes configurações padrão:

- **Mensagem automática**: "Olá! No momento não estou disponível. Assim que possível irei responder sua mensagem. Obrigado!"
- **Limite anti-spam**: 3 mensagens por minuto
- **Tempo de reativação**: 30 minutos após última resposta do dono
- **Não funciona em grupos**: Apenas conversas individuais

## 🎮 Comandos no Terminal

Enquanto o bot estiver rodando, você pode usar estes comandos:

- `toggle` - Ativar/desativar respostas automáticas
- `clear` - Limpar histórico de chats respondidos
- `status` - Ver status atual do bot
- `stop` ou `quit` - Parar o bot

## 🔧 Como funciona

1. **Primeira mensagem**: Bot responde automaticamente
2. **Mensagens seguintes**: Bot não responde até que você (dono) responda
3. **Quando você responde**: Bot para de responder naquela conversa
4. **Após 30 minutos**: Se você não mandar mais mensagens, bot reativa
5. **Anti-spam**: Máximo 3 mensagens por minuto por contato

## 🛡️ Segurança

- Não funciona em grupos
- Sistema anti-spam integrado
- Não responde para o próprio dono
- Sessão salva localmente (não precisa escanear QR toda vez)

## 📝 Personalização

Para alterar a mensagem de resposta, edite a linha no arquivo `bot.js`:

```javascript
autoResponseMessage: "Sua mensagem personalizada aqui"
```

## 🐛 Solução de Problemas

- **QR Code não aparece**: Verifique se tem Node.js instalado
- **Bot não responde**: Verifique se não está em grupo
- **Erro de conexão**: Tente deletar a pasta `.wwebjs_auth` e reconectar

## 📋 Requisitos

- Node.js 14 ou superior
- WhatsApp instalado no celular
- Conexão com internet estável

## 🎯 APIs Disponíveis

### Status do Bot
```
GET https://seu-projeto.vercel.app/api/status
```

### Configurações
```
GET https://seu-projeto.vercel.app/api/config
POST https://seu-projeto.vercel.app/api/config
```

### Webhook (WhatsApp)
```
POST https://seu-projeto.vercel.app/api/webhook
```

## ⚙️ Configurações

### Variáveis de Ambiente

- `WHATSAPP_TOKEN` - Token da WhatsApp Business API
- `WHATSAPP_PHONE_ID` - ID do número de telefone
- `WEBHOOK_VERIFY_TOKEN` - Token para verificação do webhook
- `AUTO_RESPONSE_MESSAGE` - Mensagem de resposta automática
- `SPAM_LIMIT` - Limite de mensagens por minuto (padrão: 3)
- `REACTIVATION_TIME` - Tempo para reativação em ms (padrão: 1800000 = 30min)

### Personalizar Mensagem

Para alterar a mensagem de resposta, configure a variável `AUTO_RESPONSE_MESSAGE` na Vercel ou use a API:

```bash
curl -X POST https://seu-projeto.vercel.app/api/config \
  -H "Content-Type: application/json" \
  -d '{"message": "Sua nova mensagem aqui"}'
```

## 🔧 Como funciona

1. **Webhook recebe mensagem** do WhatsApp Business API
2. **Primeira mensagem**: Bot responde automaticamente
3. **Mensagens seguintes**: Bot não responde até que você (dono) responda
4. **Quando você responde**: Bot para de responder naquela conversa
5. **Após 30 minutos**: Se você não mandar mais mensagens, bot reativa
6. **Anti-spam**: Máximo 3 mensagens por minuto por contato

## 🛡️ Segurança

- Webhook com token de verificação
- Sistema anti-spam integrado
- Variáveis de ambiente protegidas
- CORS configurado adequadamente

## 📱 Diferenças da Versão Local

Esta versão serverless usa a **WhatsApp Business API** ao invés de `whatsapp-web.js`:

- ✅ Mais estável e confiável
- ✅ Não precisa manter conexão ativa
- ✅ Escalável automaticamente
- ✅ Sempre online na Vercel
- ❌ Requer aprovação do WhatsApp Business
- ❌ Pode ter custos para alto volume

## 🐛 Solução de Problemas

- **Webhook não funciona**: Verifique se a URL está correta e acessível
- **Bot não responde**: Verifique as variáveis de ambiente
- **Erro 403**: Verifique o `WEBHOOK_VERIFY_TOKEN`
- **Mensagens não chegam**: Verifique configuração do WhatsApp Business API

## 📋 Requisitos

- Conta WhatsApp Business API
- Conta Vercel (gratuita)
- Domínio HTTPS (Vercel fornece automaticamente)

## 🔗 Links Úteis

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Vercel Documentation](https://vercel.com/docs)
- [Facebook Developers](https://developers.facebook.com/)