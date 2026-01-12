# WhatsApp Auto Responder Bot

Bot de WhatsApp que responde automaticamente quando você não está disponível.

## 🚀 Funcionalidades

- ✅ Conexão via QR Code
- ✅ Resposta automática apenas uma vez por conversa
- ✅ Desativa automaticamente quando o dono responde
- ✅ Reativa após 30 minutos de inatividade do dono
- ✅ Sistema anti-spam (máximo 3 mensagens por minuto)
- ✅ Não envia mensagens em grupos
- ✅ Controles via terminal

## 📦 Instalação

1. Clone ou baixe os arquivos
2. Instale as dependências:
```bash
npm install
```

## 🎯 Como usar

1. Execute o bot:
```bash
npm start
```

2. Escaneie o QR Code que aparece no terminal com seu WhatsApp

3. O bot estará ativo e responderá automaticamente

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