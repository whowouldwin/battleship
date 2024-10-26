export interface WebsocketMessage {
  type: string;
  data: any;
  id?: number;
  index?: number | string;
  error?: boolean;
  errorText?: string;
}

export interface Player {
  id: string;
  name: string;
  password: string;
  wins: number;
}

export interface RegistrationResponseData {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
}

export interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
}
