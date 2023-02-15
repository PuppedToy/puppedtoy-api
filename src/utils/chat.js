const ioFactory = require('socket.io');
const jwt = require('./jwt');

function initChat(server) {
  const io = ioFactory(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    let name;
    socket.on('identify', (token) => {
      try {
        const { name: newUserName } = jwt.verify(token);
        name = newUserName;
      } catch (e) {
        socket.emit('error', 'Invalid token');
        return;
      }
      io.emit('message', `> ${name} has joined the chat`);
    });

    socket.on('message', (message) => {
      if (!name) {
        socket.emit('error', 'You must identify first');
        return;
      }
      io.emit('message', `${name}: ${message}`);
    });

    socket.on('disconnect', () => {
      io.emit('message', `> ${name} has left the chat`);
    });
  });

  return io;
}

module.exports = { initChat };
