// API para verificar status do bot
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const status = {
            bot: 'WhatsApp Auto Responder',
            status: 'active',
            version: '2.0.0',
            platform: 'Vercel Serverless',
            timestamp: new Date().toISOString(),
            endpoints: {
                webhook: '/api/webhook',
                status: '/api/status',
                config: '/api/config'
            }
        };

        return res.status(200).json(status);
    }

    return res.status(405).json({ error: 'Method not allowed' });
};