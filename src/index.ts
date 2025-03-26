import fastify from 'fastify';
import { whatsappRoutes } from './routes/whatsapp';

const server = fastify({
  logger: true
});

// Register routes
server.register(whatsappRoutes, { prefix: '/api/whatsapp' });

// Health check route
server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Run the server
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 