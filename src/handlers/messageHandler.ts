import WebSocket from 'ws';
import { handleRegistration } from './registrationHandler.js';
import { RegistrationResponseData, WebsocketMessage } from '../types/types.js';
import { addUserToRoom, createRoom, updateRoomState } from './roomHandler.js';

export function handleWebSocketMessage(ws: WebSocket, message: any) {
  try {
    const messageString = typeof message === 'string' ? message : message.toString();
    const parsedMessage: WebsocketMessage = JSON.parse(messageString);
    console.log('Received message:', parsedMessage);
    parsedMessage.id = 0;

    if (typeof parsedMessage.data === 'string' && parsedMessage.data.trim() !== '') {
      parsedMessage.data = JSON.parse(parsedMessage.data);
    }

    switch (parsedMessage.type) {
      case 'create_room': {
        const response = createRoom(parsedMessage.data);
        ws.send(JSON.stringify(response));

        const roomUpdate = updateRoomState();
        ws.send(JSON.stringify(roomUpdate));
        break;
      }
      case 'add_user_to_room':
        const { indexRoom } = parsedMessage.data;
        const responses = addUserToRoom(indexRoom, parsedMessage.data.player);
        responses.forEach((response: WebsocketMessage) => {
          ws.send(JSON.stringify(response));
        });
        const roomUpdate = updateRoomState();
        ws.send(JSON.stringify(roomUpdate));
        break;
      case 'reg':
        if (typeof parsedMessage.data === 'string') {
          parsedMessage.data = JSON.parse(parsedMessage.data);
        }
        console.log(
          'Handling registration for:',
          JSON.stringify(parsedMessage, null, 2),
        );
        const regResponse = handleRegistration(
          parsedMessage.data.name,
          parsedMessage.data.password,
        );

        ws.send(
          JSON.stringify({
            type: 'reg',
            data: JSON.stringify({
              name: parsedMessage.data.name,
              index: regResponse.index,
              error: regResponse.error,
              errorText: regResponse.errorText,
            }),
            id: 0,
          }),
        );
        break;
      default:
        console.log('This command is not supported', parsedMessage.type);
        ws.send(
          JSON.stringify({
            type: 'error',
            data: JSON.stringify({
              error: true,
              errorText: `Command ${parsedMessage.type} is not supported`,
            }),
            id: 0,
          }),
        );
        break;
    }
  } catch (e) {
    console.error('Error while processing websocket message', e);
    ws.send(
      JSON.stringify({
        type: 'error',
        data: JSON.stringify({
          error: true,
          errorText: 'Failed to process message',
        }),
        id: 0,
      }),
    );
  }
}
