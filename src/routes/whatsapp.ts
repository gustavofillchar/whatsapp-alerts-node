import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import whatsappService from '../services/whatsapp';

interface SendMessageRequest {
  number: string;
  message: string;
}

export async function whatsappRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Connect to WhatsApp
  fastify.post('/connect', async (request, reply) => {
    try {
      const result = await whatsappService.connect();
      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to connect to WhatsApp',
        message: (error as Error).message 
      });
    }
  });

  // Force new connection with QR code
  fastify.post('/reset-connection', async (request, reply) => {
    try {
      await whatsappService.clearSession();
      const result = await whatsappService.connect(true);
      return reply.code(200).send({
        ...result,
        message: 'Sessions cleared, new QR code will be generated'
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to reset WhatsApp connection',
        message: (error as Error).message 
      });
    }
  });

  // Check connection status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = whatsappService.getStatus();
      return reply.code(200).send(status);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to get WhatsApp status',
        message: (error as Error).message 
      });
    }
  });

  // Get QR code
  fastify.get('/qrcode', async (request, reply) => {
    try {
      const qrCode = whatsappService.getQrCode();
      
      if (!qrCode.qrCode) {
        return reply.code(404).send({ 
          error: 'QR code not available', 
          status: qrCode.status 
        });
      }
      
      return reply.code(200).send(qrCode);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to get QR code',
        message: (error as Error).message 
      });
    }
  });

  // Send message
  fastify.post<{ Body: SendMessageRequest }>('/send-message', async (request, reply) => {
    const { number, message } = request.body;
    
    if (!number || !message) {
      return reply.code(400).send({ 
        error: 'Missing required fields',
        message: 'Both number and message are required' 
      });
    }

    try {
      const result = await whatsappService.sendMessage(number, message);
      return reply.code(200).send({ 
        success: true,
        result 
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to send message',
        message: (error as Error).message 
      });
    }
  });

  // Disconnect from WhatsApp
  fastify.post('/disconnect', async (request, reply) => {
    try {
      const result = await whatsappService.disconnect();
      return reply.code(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to disconnect from WhatsApp',
        message: (error as Error).message 
      });
    }
  });
} 