import WebSocket from 'ws';
import { handleRegistration } from './registrationHandler.js';
import { RegistrationResponseData, WebsocketMessage } from '../types/types.js';

export function handleWebSocketMessage(ws: WebSocket, message: any) {
  try {
    const messageString = typeof message === 'string' ? message : message.toString();
    const parsedMessage: WebsocketMessage = JSON.parse(messageString);

    parsedMessage.id = 0;

    switch (parsedMessage.type) {
      case "reg":
        if(typeof parsedMessage.data === 'string') {
          parsedMessage.data = JSON.parse(parsedMessage.data);
        }
        console.log("Handling registration for:", JSON.stringify(parsedMessage, null, 2));
        const regResponse = handleRegistration(parsedMessage.data.name, parsedMessage.data.password) ;

        ws.send(JSON.stringify({
          type: "reg",
          data: JSON.stringify({
            name: parsedMessage.data.name,
            index: regResponse.index,
            error: regResponse.error,
            errorText: regResponse.errorText,
          }),
          id: 0,
        }));
        break;
      default:
        console.log('This command is not supported', parsedMessage.type);
        ws.send(JSON.stringify({
          type: "error",
          data: JSON.stringify({
            error: true,
            errorText: `Command ${parsedMessage.type} is not supported`,
          }),
          id: 0,
        }));
        break;
    }
  } catch (e) {
    console.error('Error while processing websocket message', e);
    ws.send(JSON.stringify({
      type: "error",
      data: JSON.stringify({
        error: true,
        errorText: 'Failed to process message',
      }),
      id: 0,
    }));
  }
}