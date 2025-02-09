import { Server as HTTPServer } from "http";

import { createClient } from "@supabase/supabase-js";
import { Server as SocketServer } from "socket.io";

import type { ChatMessage } from "@/types/models";
import type { Database } from "@/types/supabase";

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const initializeSocket = (server: HTTPServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left room ${roomId}`);
    });

    socket.on("send_message", async (message: ChatMessage) => {
      try {
        // Save message to database
        const { error } = await supabase.from("chat_messages").insert(message);

        if (error) throw error;

        // Broadcast message to room
        io.to(message.room_id).emit("receive_message", message);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
