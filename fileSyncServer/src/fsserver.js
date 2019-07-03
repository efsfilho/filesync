const net =  require('net');
const server = net.createServer();

const ADDR = process.env.FSSRV_ADDR || '0.0.0.0';
const PORT = process.env.FSSRV_PORT || 3000;

server.on('connection', socket => {

  data = null;

  socket.on('data', chunk => {
    console.log(chunk);
  }); 
  socket.on('error', err => { console.log('Erro server socket:', err) });
});

server.on('error', err => { console.log('Erro:', err) });
server.listen(PORT, ADDR, () => {
  console.log('Servidor FileSync:', server.address());
});
