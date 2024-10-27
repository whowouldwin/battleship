import { WebSocket } from "ws";

export interface WebsocketMessage {
  type: string;
  data: string;
  id: number;
}

export interface Player {
  id: string;
  name: string;
  password: string;
  wins: number;
  ws: WebSocket;
  ships?: Ship[];
}

export interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}