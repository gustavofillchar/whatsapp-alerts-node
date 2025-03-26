import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  makeInMemoryStore,
  Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import pino from 'pino';

const logger = pino({ level: 'warn' });
const sessionDir = path.join(process.cwd(), 'sessions');

// Create sessions directory if it doesn't exist
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// In-memory store for session data
const store = makeInMemoryStore({ logger });

class WhatsAppService {
  private socket: any = null;
  private qrCode: string | null = null;
  private connectionStatus: string = 'disconnected';
  private authState: any = null;

  constructor() {}

  async connect(forceNewSession = false) {
    if (this.connectionStatus === 'connected') {
      return { status: 'already connected' };
    }

    try {
      this.connectionStatus = 'connecting';
      
      // Clear session if force new session is requested
      if (forceNewSession) {
        await this.clearSession();
      }
      
      // Get authentication state
      this.authState = await useMultiFileAuthState(sessionDir);
      
      // Create a new connection
      this.socket = makeWASocket({
        auth: this.authState.state,
        printQRInTerminal: true,
        browser: Browsers.ubuntu('Chrome'),
        logger
      });

      store.bind(this.socket.ev);

      // Handle connection update
      this.socket.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qrCode = qr;
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            this.connect();
          } else {
            this.connectionStatus = 'disconnected';
          }
        } else if (connection === 'open') {
          this.connectionStatus = 'connected';
          this.qrCode = null;
        }
      });

      // Save authentication credentials when updated
      this.socket.ev.on('creds.update', this.authState.saveCreds);
      
      return { status: this.connectionStatus };
    } catch (error) {
      this.connectionStatus = 'disconnected';
      throw error;
    }
  }

  async clearSession() {
    try {
      // Disconnect current session if connected
      if (this.socket) {
        await this.disconnect();
      }
      
      // Delete all session files
      if (fs.existsSync(sessionDir)) {
        const files = fs.readdirSync(sessionDir);
        for (const file of files) {
          const filePath = path.join(sessionDir, file);
          fs.unlinkSync(filePath);
        }
      }
      
      this.qrCode = null;
      this.connectionStatus = 'disconnected';
      return { status: 'session cleared' };
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(number: string, message: string) {
    if (this.connectionStatus !== 'connected' || !this.socket) {
      throw new Error('WhatsApp is not connected');
    }

    try {
      // Format the number to include country code and ensure it's in the proper format
      const formattedNumber = `${number.replace(/[^\d]/g, '')}@s.whatsapp.net`;
      
      // Send the message
      const result = await this.socket.sendMessage(formattedNumber, { text: message });
      return result;
    } catch (error) {
      throw error;
    }
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      hasQrCode: !!this.qrCode
    };
  }

  getQrCode() {
    return {
      qrCode: this.qrCode,
      status: this.connectionStatus
    };
  }

  async disconnect() {
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
      this.qrCode = null;
      this.connectionStatus = 'disconnected';
      return { status: 'disconnected' };
    }
    return { status: 'already disconnected' };
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();

export default whatsappService; 