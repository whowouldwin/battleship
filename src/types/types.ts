export interface WebsocketMessage {
  type: string;
  data: any;
  id: number
}

export interface Player {
  id: string;
  name: string;
  password: string;
  wins: number;
}

export interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
}