// API para configurar o bot
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificar configurações atuais (GET)
    if (req.method === 'GET') {
        const config = {
            autoResponseMessage: process.env.AUTO_RESPONSE_MESSAGE || "Olá! No momento não estou disponível. Assim que possível irei responder sua mensagem. Obrigado!",
            spamLimit: parseInt(process.env.SPAM_LIMIT) || 3,
            spamTimeWindow: parseInt(process.env.SPAM_TIME_WINDOW) || 60000,
            reactivationTime: parseInt(process.env.REACTIVATION_TIME) || 1800000,
            webhookConfigured: !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_ID
        };

        return res.status(200).json(config);
    }

    // Atualizar configurações (POST)
    if (req.method === 'POST') {
        try {
            const { message, spamLimit, reactivationMinutes } = req.body;

            // Em produção, você salvaria essas configurações em um banco de dados
            // Por enquanto, retornamos apenas confirmação
            const updatedConfig = {
                message: message || "Configuração atualizada via API",
                spamLimit: spamLimit || 3,
                reactivationTime: (reactivationMinutes || 30) * 60 * 1000,
                updated: new Date().toISOString()
            };

            return res.status(200).json({
                success: true,
                message: "Configurações atualizadas com sucesso",
                config: updatedConfig
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: "Erro ao atualizar configurações"
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};