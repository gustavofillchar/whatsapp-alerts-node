# WhatsApp Alerts API

A simple Node.js API for sending WhatsApp messages using [Baileys](https://github.com/WhiskeySockets/Baileys) library and Fastify.

## Features

- Connect to WhatsApp via QR code
- Send messages to WhatsApp contacts
- Check connection status
- Get QR code for authentication
- Disconnect from WhatsApp

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the development server:
   ```
   pnpm dev
   ```
4. Or build and run in production:
   ```
   pnpm build
   pnpm start
   ```

## API Endpoints

### Connect to WhatsApp
```
POST /api/whatsapp/connect
```
Initiates the connection with WhatsApp and generates a QR code for authentication.

### Force New Connection
```
POST /api/whatsapp/reset-connection
```
Clears all existing session data and forces a new QR code to be generated for authentication.

### Check Connection Status
```
GET /api/whatsapp/status
```
Returns the current status of the WhatsApp connection.

### Get QR Code
```
GET /api/whatsapp/qrcode
```
Returns the QR code needed to authenticate with WhatsApp Web.

### Send Message
```
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "number": "5511999999999",
  "message": "Hello, this is a test message!"
}
```
Sends a message to the specified number. Number should include country code.

### Disconnect
```
POST /api/whatsapp/disconnect
```
Ends the WhatsApp connection.

## Usage Example

1. First, connect to WhatsApp:
   ```
   curl -X POST http://localhost:3000/api/whatsapp/connect
   ```

2. If you need to force a new QR code (like when changing accounts):
   ```
   curl -X POST http://localhost:3000/api/whatsapp/reset-connection
   ```

3. Get the QR code and scan it with your phone:
   ```
   curl http://localhost:3000/api/whatsapp/qrcode
   ```

4. Check if you're connected:
   ```
   curl http://localhost:3000/api/whatsapp/status
   ```

5. Send a message:
   ```
   curl -X POST -H "Content-Type: application/json" -d '{"number":"5511999999999","message":"Hello from the API!"}' http://localhost:3000/api/whatsapp/send-message
   ```

6. Disconnect when done:
   ```
   curl -X POST http://localhost:3000/api/whatsapp/disconnect
   ```

## Notes

- The first connection will require scanning a QR code with your WhatsApp phone app
- Session data is stored in the `sessions` directory and will be reused for future connections
- If you need to connect with a different WhatsApp account, use the reset-connection endpoint
- Make sure your phone has an active internet connection while using the API 