const net =  require('net');
const fs = require('fs');
const path = require('path');
const FileHandler = require('./filehandler');
const server = net.createServer();

const COMM_SIZE = 282;   // Tamanho dos comandos para serem detectados
const COMM_PATT = /^\{\Scomm.*\}$/; // Padrao dos objetos de comando

const ADDR = process.env.FSSRV_ADDR || '0.0.0.0';
const PORT = process.env.FSSRV_PORT || 3000;
const DIR_UPDATE = process.env.FSSRV_CDIR || null;

let fileName = null; // Nome dos arquivos fornecidos pelos comandos
let lastCommand = null; // Operação do comando 'CREATE'/'DELETE'
let data = null; 

server.on('connection', socket => {

  data = null;

  socket.on('data', chunk => processData(chunk));
  socket.on('end', () => {

    //  Executa o comando com os dados capturados
    if (lastCommand == 'CREATE' && fileName != null) {
      /* Limpar data apos uso. */
      atualizaArquivo(fileName, data);
    }
    
    if (lastCommand == 'DELETE' && fileName != null) {
      deletaArquivo(fileName);
    }
    
    lastCommand = null;
  });
  
  socket.on('error', err => { console.log('Erro server socket:', err) });
});

server.on('error', err => { console.log('Erro:', err) });
server.listen(PORT, ADDR, () => {
  console.log('Servidor FileSync:', server.address());
});

// Processa dados enviado pelo cliente
processData = (chunk) => {
  
  if (chunk.length == COMM_SIZE) {
    /*
      Filtra chunks com comandos 
      pela validação de tamanho(COMM_SIZE) e estrutura(COMM_PATT)
    */
    let packetStr = chunk.toString();
    if (packetStr != null && COMM_PATT.test(packetStr)) {
      let packet = JSON.parse(packetStr);     
      lastCommand = packet.comm;
      fileName = packet.file.replace(/\*/gi,''); // remove char *
    }
  } else {
    /*
      Captura os dados para as operações que serão executadas no event end
    */
    if (data == null) {
      data = Buffer.from(chunk);
    } else {
      data = Buffer.concat([data, Buffer.from(chunk)]);
    }
  }
}

// Cria/Atualiza arquivo
atualizaArquivo = (fileName, data) =>  {
  let filePath = path.join(DIR_UPDATE, fileName);

  fs.writeFile(filePath, data, err =>{
    if (err) {
      console.log('erro ao salvar')
    } else {
      console.log('Arquivo atualizado:', filePath);
    }
    data = null;
  });
}

deletaArquivo = fileName => {
  let filePath = path.join(DIR_UPDATE, fileName);
  fs.unlink(filePath, err => {
    if (err) {
      console.log('Não foi possível deletar o arquivo');
    } else {
      console.log('Arquivo deletado', filePath);
    }
  });
}

// let filesInfo = [];

// comparaArquivos = () => {
//   return FileHandler.listaArquivos(DIR_UPDATE).then(files => {
//     // console.log(files);
//     return FileHandler.montaInfo(files);
//   }).then(files => {
//     for (const file of filesInfo) {

//     }
//   }).catch(err => {
//     console.log(err);
//   });
// }

if (!FileHandler.verificaCaminho(DIR_UPDATE)) {
  console.log(`Não foi possível acessar o diretório ${DIR_UPDATE}.`);
  process.exit(1);
}