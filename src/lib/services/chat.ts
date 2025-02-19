import { Server } from "socket.io";

import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  room_id?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env["NEXT_PUBLIC_APP_URL"],
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on("join_room", (room_id: string) => {
      if (room_id) {
        socket.join(room_id);
      }
    });

    socket.on("send_message", (message: Message) => {
      if (message.room_id) {
        io.to(message.room_id).emit("receive_message", message);
      }
    });
  });

  res.end();
}
