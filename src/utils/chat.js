// Import the required packages and modules
const ioFactory = require('socket.io');
const jwt = require('./jwt');

// This function initializes a socket.io server for chat
function initChat(server) {
  // Create a new socket.io instance, passing the HTTP server as a parameter
  const io = ioFactory(server, {
    cors: {
      origin: '*',
    },
  });

  // Listen for a connection event, which occurs when a client connects to the server
  io.on('connection', (socket) => {
    // Define a variable to store the user's name
    let name;

    // Listen for an 'identify' event, which is used to authenticate the user
    socket.on('identify', (token) => {
      try {
        // Verify the user's token and extract their name
        const { name: newUserName } = jwt.verify(token);
        name = newUserName;
      } catch (e) {
        // If the token is invalid, emit an error event and return
        socket.emit('error', 'Invalid token');
        return;
      }
      // If the token is valid, emit a message event to all clients that the user has joined
      io.emit('message', `> ${name} has joined the chat`);
    });

    // Listen for a 'message' event, which is used to send chat messages
    socket.on('message', (message) => {
      if (!name) {
        // If the user has not been authenticated, emit an error event and return
        socket.emit('error', 'You must identify first');
        return;
      }
      // If the user has been authenticated, emit a message event to all clients with the message and the user's name
      io.emit('message', `${name}: ${message}`);
    });

    // Listen for a 'disconnect' event, which occurs when a client disconnects from the server
    socket.on('disconnect', () => {
      // Emit a message event to all clients that the user has left the chat
      io.emit('message', `> ${name} has left the chat`);
    });
  });

  // Return the initialized socket.io instance
  return io;
}

// Export the 'initChat' function as a module
module.exports = { initChat };