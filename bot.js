const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        // Controle de estado do bot
        this.botActive = true;
        this.respondedChats = new Map(); // chatId -> { responded: boolean, lastOwnerMessage: timestamp }
        this.userMessageCount = new Map(); // chatId -> { count: number, lastReset: timestamp }
        
        // Configurações
        this.config = {
            autoResponseMessage: "Olá! No momento não estou disponível. Assim que possível irei responder sua mensagem. Obrigado!",
            spamLimit: 3, // máximo de mensagens por período
            spamTimeWindow: 60000, // 1 minuto em ms
            reactivationTime: 30 * 60 * 1000, // 30 minutos em ms
            ownerNumber: null // será definido automaticamente
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Evento de QR Code
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Evento de conexão
        this.client.on('ready', async () => {
            console.log('✅ Bot conectado com sucesso!');
            const info = this.client.info;
            this.config.ownerNumber = info.wid.user;
            console.log(`📞 Número conectado: ${info.pushname} (${this.config.ownerNumber})`);
        });

        // Evento de nova mensagem
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Evento de desconexão
        this.client.on('disconnected', (reason) => {
            console.log('❌ Cliente desconectado:', reason);
        });
    }

    async handleMessage(message) {
        try {
            const chat = await message.getChat();
            const contact = await message.getContact();
            const chatId = chat.id._serialized;
            const isFromOwner = contact.number === this.config.ownerNumber;

            // Ignorar grupos
            if (chat.isGroup) {
                return;
            }

            // Ignorar mensagens do próprio bot
            if (message.fromMe) {
                return;
            }

            console.log(`📨 Mensagem de ${contact.pushname || contact.number}: ${message.body}`);

            // Se a mensagem é do dono da conta
            if (isFromOwner) {
                return; // Dono não recebe resposta automática
            }

            // Verificar se o dono respondeu recentemente neste chat
            if (await this.checkOwnerRecentActivity(chatId)) {
                console.log(`🔇 Bot desativado para ${contact.pushname} - dono respondeu recentemente`);
                return;
            }

            // Sistema anti-spam
            if (this.isSpam(chatId)) {
                console.log(`🚫 Spam detectado de ${contact.pushname} - ignorando mensagem`);
                return;
            }

            // Verificar se já respondeu para este contato
            const chatState = this.respondedChats.get(chatId);
            if (chatState && chatState.responded) {
                console.log(`✋ Já respondi para ${contact.pushname} - aguardando`);
                return;
            }

            // Enviar resposta automática
            await this.sendAutoResponse(chat, contact);

        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }

    async checkOwnerRecentActivity(chatId) {
        try {
            const chat = await this.client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 10 });
            
            const now = Date.now();
            const reactivationTime = this.config.reactivationTime;

            // Procurar por mensagens do dono nos últimos 30 minutos
            for (const msg of messages) {
                if (msg.fromMe && (now - msg.timestamp * 1000) < reactivationTime) {
                    // Marcar que o dono respondeu recentemente
                    this.respondedChats.set(chatId, {
                        responded: false, // Reset para permitir nova resposta automática depois
                        lastOwnerMessage: now
                    });
                    return true;
                }
            }

            // Verificar se passou o tempo de reativação
            const chatState = this.respondedChats.get(chatId);
            if (chatState && chatState.lastOwnerMessage) {
                if ((now - chatState.lastOwnerMessage) >= reactivationTime) {
                    // Reativar bot para este chat
                    this.respondedChats.delete(chatId);
                    console.log(`🔄 Bot reativado para chat ${chatId}`);
                    return false;
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Erro ao verificar atividade do dono:', error);
            return false;
        }
    }

    isSpam(chatId) {
        const now = Date.now();
        const userState = this.userMessageCount.get(chatId) || { count: 0, lastReset: now };

        // Reset contador se passou o tempo limite
        if (now - userState.lastReset > this.config.spamTimeWindow) {
            userState.count = 0;
            userState.lastReset = now;
        }

        userState.count++;
        this.userMessageCount.set(chatId, userState);

        // Verificar se excedeu o limite
        if (userState.count > this.config.spamLimit) {
            return true;
        }

        return false;
    }

    async sendAutoResponse(chat, contact) {
        try {
            const chatId = chat.id._serialized;
            
            // Marcar como respondido
            this.respondedChats.set(chatId, {
                responded: true,
                lastOwnerMessage: null
            });

            // Enviar mensagem
            await chat.sendMessage(this.config.autoResponseMessage);
            console.log(`✅ Resposta automática enviada para ${contact.pushname || contact.number}`);

        } catch (error) {
            console.error('❌ Erro ao enviar resposta automática:', error);
        }
    }

    // Método para alterar a mensagem de resposta
    setAutoResponseMessage(message) {
        this.config.autoResponseMessage = message;
        console.log('✅ Mensagem de resposta automática atualizada');
    }

    // Método para ativar/desativar o bot
    toggleBot() {
        this.botActive = !this.botActive;
        console.log(`🤖 Bot ${this.botActive ? 'ativado' : 'desativado'}`);
    }

    // Método para limpar histórico de chats respondidos
    clearRespondedChats() {
        this.respondedChats.clear();
        console.log('🧹 Histórico de chats respondidos limpo');
    }

    // Iniciar o bot
    async start() {
        try {
            console.log('🚀 Iniciando WhatsApp Bot...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Erro ao iniciar o bot:', error);
        }
    }

    // Parar o bot
    async stop() {
        try {
            await this.client.destroy();
            console.log('🛑 Bot parado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao parar o bot:', error);
        }
    }
}

// Inicializar e executar o bot
const bot = new WhatsAppBot();

// Comandos de controle via console
process.stdin.setEncoding('utf8');
console.log('\n📋 Comandos disponíveis:');
console.log('- "stop" ou "quit": Parar o bot');
console.log('- "toggle": Ativar/desativar respostas automáticas');
console.log('- "clear": Limpar histórico de chats respondidos');
console.log('- "status": Ver status do bot\n');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        const command = chunk.trim().toLowerCase();
        
        switch (command) {
            case 'stop':
            case 'quit':
                bot.stop().then(() => process.exit(0));
                break;
            case 'toggle':
                bot.toggleBot();
                break;
            case 'clear':
                bot.clearRespondedChats();
                break;
            case 'status':
                console.log(`🤖 Bot: ${bot.botActive ? 'Ativo' : 'Inativo'}`);
                console.log(`📊 Chats com resposta: ${bot.respondedChats.size}`);
                break;
            default:
                if (command) {
                    console.log('❓ Comando não reconhecido');
                }
        }
    }
});

// Iniciar o bot
bot.start();

// Tratamento de sinais para encerramento gracioso
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando bot...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Encerrando bot...');
    await bot.stop();
    process.exit(0);
});