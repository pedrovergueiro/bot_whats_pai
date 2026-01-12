const axios = require('axios');

// Simulação de banco de dados em memória (em produção use um banco real)
let chatStates = new Map();
let userMessageCount = new Map();

const config = {
    autoResponseMessage: "Olá! No momento não estou disponível. Assim que possível irei responder sua mensagem. Obrigado!",
    spamLimit: 3,
    spamTimeWindow: 60000, // 1 minuto
    reactivationTime: 30 * 60 * 1000, // 30 minutos
    whatsappToken: process.env.WHATSAPP_TOKEN, // Token da API do WhatsApp Business
    whatsappPhoneId: process.env.WHATSAPP_PHONE_ID, // ID do telefone
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'meu_token_secreto'
};

// Função para verificar spam
function isSpam(chatId) {
    const now = Date.now();
    const userState = userMessageCount.get(chatId) || { count: 0, lastReset: now };

    if (now - userState.lastReset > config.spamTimeWindow) {
        userState.count = 0;
        userState.lastReset = now;
    }

    userState.count++;
    userMessageCount.set(chatId, userState);

    return userState.count > config.spamLimit;
}

// Função para verificar se o dono respondeu recentemente
function checkOwnerRecentActivity(chatId) {
    const chatState = chatStates.get(chatId);
    if (!chatState || !chatState.lastOwnerMessage) {
        return false;
    }

    const now = Date.now();
    if ((now - chatState.lastOwnerMessage) >= config.reactivationTime) {
        // Reativar bot para este chat
        chatStates.delete(chatId);
        console.log(`🔄 Bot reativado para chat ${chatId}`);
        return false;
    }

    return true;
}

// Função para enviar mensagem via WhatsApp Business API
async function sendWhatsAppMessage(to, message) {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${config.whatsappPhoneId}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: message
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.whatsappToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Mensagem enviada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
        throw error;
    }
}

// Handler principal do webhook
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificação do webhook (GET)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === config.webhookVerifyToken) {
            console.log('✅ Webhook verificado com sucesso');
            return res.status(200).send(challenge);
        } else {
            console.log('❌ Falha na verificação do webhook');
            return res.status(403).send('Forbidden');
        }
    }

    // Processamento de mensagens (POST)
    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (body.object === 'whatsapp_business_account') {
                for (const entry of body.entry) {
                    for (const change of entry.changes) {
                        if (change.field === 'messages') {
                            const messages = change.value.messages;
                            const contacts = change.value.contacts;

                            if (messages && messages.length > 0) {
                                for (const message of messages) {
                                    await processMessage(message, contacts);
                                }
                            }
                        }
                    }
                }
            }

            return res.status(200).json({ status: 'success' });
        } catch (error) {
            console.error('❌ Erro ao processar webhook:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

async function processMessage(message, contacts) {
    try {
        const from = message.from;
        const messageText = message.text?.body;
        const messageType = message.type;

        // Ignorar mensagens que não são texto
        if (messageType !== 'text') {
            return;
        }

        // Encontrar informações do contato
        const contact = contacts?.find(c => c.wa_id === from);
        const contactName = contact?.profile?.name || from;

        console.log(`📨 Mensagem de ${contactName} (${from}): ${messageText}`);

        // Verificar se o dono respondeu recentemente neste chat
        if (checkOwnerRecentActivity(from)) {
            console.log(`🔇 Bot desativado para ${contactName} - dono respondeu recentemente`);
            return;
        }

        // Sistema anti-spam
        if (isSpam(from)) {
            console.log(`🚫 Spam detectado de ${contactName} - ignorando mensagem`);
            return;
        }

        // Verificar se já respondeu para este contato
        const chatState = chatStates.get(from);
        if (chatState && chatState.responded) {
            console.log(`✋ Já respondi para ${contactName} - aguardando`);
            return;
        }

        // Enviar resposta automática
        await sendWhatsAppMessage(from, config.autoResponseMessage);

        // Marcar como respondido
        chatStates.set(from, {
            responded: true,
            lastOwnerMessage: null,
            lastAutoResponse: Date.now()
        });

        console.log(`✅ Resposta automática enviada para ${contactName}`);

    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
    }
}