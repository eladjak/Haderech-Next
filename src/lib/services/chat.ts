import { Server as HTTPServer } from 'http'
import { Server as IOServer, Socket } from 'socket.io'
import { createClient } from '@supabase/supabase-js'

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name: string;
  };
}

interface ChatRoom {
  id: string;
  participants: string[];
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
}

export const initializeSocket = (server: HTTPServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const connectedUsers = new Map<string, Socket>();

  io.on('connection', async (socket: Socket) => {
    console.log('New client connected');

    // Authenticate user
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      socket.disconnect();
      return;
    }

    // Add user to connected users
    connectedUsers.set(user.id, socket);

    // Update user status
    await supabase
      .from('profiles')
      .update({ 
        online: true,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id);

    // Join user's chat rooms
    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .contains('participants', [user.id]);

    rooms?.forEach(room => {
      socket.join(room.id);
    });

    // Handle new message
    socket.on('send_message', async (data: { 
      room_id: string;
      content: string;
      receiver_id: string;
    }) => {
      try {
        // Save message to database
        const { data: message, error } = await supabase
          .from('chat_messages')
          .insert({
            room_id: data.room_id,
            content: data.content,
            sender_id: user.id,
            receiver_id: data.receiver_id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update room's last message and time
        await supabase
          .from('chat_rooms')
          .update({
            last_message: message,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.room_id);

        // Emit message to room
        io.to(data.room_id).emit('new_message', message);

        // Send notification if receiver is offline
        const receiverSocket = connectedUsers.get(data.receiver_id);
        if (!receiverSocket) {
          await supabase
            .from('notifications')
            .insert({
              user_id: data.receiver_id,
              type: 'chat_message',
              content: `הודעה חדשה מ-${user.user_metadata?.name}`,
              data: { message },
              created_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'שגיאה בשליחת ההודעה' });
      }
    });

    // Handle typing status
    socket.on('typing', (data: { room_id: string; typing: boolean }) => {
      socket.to(data.room_id).emit('user_typing', {
        user_id: user.id,
        typing: data.typing
      });
    });

    // Handle read status
    socket.on('mark_read', async (data: { room_id: string }) => {
      try {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('room_id', data.room_id)
          .eq('receiver_id', user.id)
          .eq('read', false);

        socket.to(data.room_id).emit('messages_read', {
          room_id: data.room_id,
          user_id: user.id
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected');
      
      connectedUsers.delete(user.id);

      await supabase
        .from('profiles')
        .update({ 
          online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
    });
  });

  return io;
}; 