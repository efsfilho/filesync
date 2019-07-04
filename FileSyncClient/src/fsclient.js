const net = require('net');
const fs = require('fs');
const path = require('path');
const FileHandler = require('./filehandler');
const readline = require('readline');
const client = new net.Socket();

const COMM_TYPES = ['CREATE', 'DELETE']; // comandos interpretado pelo servidor

const SERVER_ADDR = process.env.FSCLI_ADDR || null;
const SERVER_PORT = process.env.FSCLI_PORT || 3000;
const DIR_WATCH = process.env.FSCLI_CDIR || null;

let sending = false; // flag de identificação de transferência de dados
let filesChanged = []; // Array com nomes dos arquivos que sofreram alteração
let filesInfo = []; // Array com nomes dos arquivos monitorados

// client.on('data', data => { 
//   // TODO receber informação dos dados que estão no servidor
// });

client.on('end', () => { sending = false; });
client.on('error', err => { console.log('Não foi possível conectar ao servidor!\n\n', err); });
client.setTimeout(5000);
client.on('timeout', () => { client.end() });

class Commando {
  constructor(type, filePath) {
    if (!COMM_TYPES.includes(type)) {
      throw 'Tipo de comando inválido';
    }

    this.type = type;
    this.filePath = filePath;
  }

  _montaNomeArquivo() {
    /*
      Constrói string com 255 chars.
      Preenche os caracteres faltantes com '*', e apaga os execedentes, garantindo
      uma string len máximo de 255.
      TODO suporte para strings maiores
    */
    let maxStr = path.basename(this.filePath);
    let times = 255 - maxStr.length;
    if (times > 0) {
       return maxStr + '*'.repeat(times);
    } else {
      return maxStr.substring(0, 255);
    }
  }

  // Retorna buffer do comando com 282 bytes
  getBuffer() {
    let comando = {
      comm: this.type,  // 8 b
      file: this._montaNomeArquivo() // 257 b
    }
    return Buffer.from(JSON.stringify(comando)) // +17 b keys
  }
}

// Envia arquivos novos e alterados para o servidor
enviaArquivo = filePath => {
  sending = true;
  return new Promise(resolve => {
    filePath = path.join(DIR_WATCH, filePath)

    client.connect(SERVER_PORT, SERVER_ADDR);
    
    let comm = new Commando('CREATE', filePath);
    client.write(comm.getBuffer());

    console.log(`Atualizando servidor: ${filePath}`);
    FileHandler.carregaArquivo(filePath).then(bufferFile => {
      setTimeout(()=> {
        client.write(Buffer.from(bufferFile));
        client.end();
      }, 500);
    }).catch(err => {
      console.log('Erro ao enviar arquivo', err);
      sending = false;
    });

    // Aguarda evento end do client
    let sendInterval = setInterval(() => {
      if (!sending) {
        clearInterval(sendInterval);        
        resolve();
      }
    }, 1000);
  });  
}

// Deleta arquivos do servidor
deletaArquivo = filePath => {
  sending = true;
  return new Promise(resolve => {
    filePath = path.join(DIR_WATCH, filePath);
    client.connect(SERVER_PORT, SERVER_ADDR);

    console.log(`Deletando do servidor: ${filePath}`);

    let comm = new Commando('DELETE', filePath);
    client.write(comm.getBuffer())
    client.end();

    // aguarda evento end do client 
    let sendInterval = setInterval(() => {
      if (!sending) {
        clearInterval(sendInterval);
        resolve();
      }
    }, 1000);
  });  
}

// Sincroniza envio de arquivos
async function enviaArquivosAsync(files) { 
  for (const file of files) {
    await enviaArquivo(file);
  }
}

// Sincroniza deleções
async function deletaArquivosAsync(files) { 
  for (const file of files) {
    await deletaArquivo(file);
  }
}

updateFiles = () => {
  FileHandler.listaArquivos(DIR_WATCH).then(files => {

    let newfiles = [];
    let oldfiles = [];

    // Identifica arquivos novos
    for (const file of files) {
      let filter = filesInfo.filter(el => el == file);
      if (filter.length == 0) {
        newfiles.push(file);
        filesInfo.push(file);
      }
    }
    
    // Identifica arquivos deletados
    for (const file of filesInfo) {
      let filter = files.filter(el => el == file);
      if (filter.length == 0) {
        oldfiles.push(file);
        let i = filesInfo.indexOf(file);
        filesInfo.splice(i, 1);
      }
    }
    
    // Identifica arquivos que sofreram alterações
    for (const file of filesChanged) {
      if (file.event == 'change') {
        newfiles.push(file.fileName);
        let i = filesChanged.indexOf(file);
        filesChanged.splice(i, 1);
      }
    }
    
    enviaArquivosAsync(newfiles).then(() => {
      deletaArquivosAsync(oldfiles);      
    });

  }).catch(err => console.log(err));
}

// Escreve no console
atualizaMensagem = (msg, log) => {
  if (!log) {
    readline.clearLine(process.stdout, 0);
  }
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(msg);
}

// flag utilizada para esperar eventos de detecção alteração nos arquivos
let isUpdating = false;
// setInterval para esperar finalização da detecção de alteração nos arquivos
let interval = null;


esperaWatch = () => {
  /*
    Cria um loop para verificar se o fs.watch() chamado no monitoraArquivos()
    terminou ou ficou pelo menos 0,5 segundo sem ser executado, para assim 
    executar o updateFiles.
   */
  const timeout = 500;

  // atualizaMensagem('Identificando alterações...');

  interval = setInterval(() => {
    if (isUpdating || sending) {
      isUpdating = false;
    } else {
      clearInterval(interval);
      interval = null;
      
      // atualizaMensagem('Dados atualizados');
      updateFiles();
    }
  }, timeout);
}

// Monitora alterações dos arquivos monitorados
monitoraArquivos = () => {
  /*
    O fs.watch é notificado várias vezes pelo OS quando ocorrem alterações de 
    arquivos monitorados por ele, independentemente do tamanho dessas alterações. 
    Por isso evitar acessar filesChanged enquanto ele está sendo executado.
  */
  fs.watch(DIR_WATCH, { recursive: false }, (event, fileName) => {
    if (filesChanged.filter(fc =>  fc.fileName == fileName).length == 0) {
      filesChanged.push({fileName, event});
    }
    if (!isUpdating) {
      isUpdating = true;
    }
    
    if (interval == null) {
      esperaWatch();
    }
  });
}

init = () => {
  if (FileHandler.verificaCaminho(DIR_WATCH)){
    setTimeout(() => {
      monitoraArquivos();
    
      FileHandler.listaArquivos(DIR_WATCH).then(files => {
        filesInfo = files;
        enviaArquivosAsync(files);
      }).catch(err => console.log(err));
    }, 3000);
    console.log(`Cliente FileSync [servidor ${SERVER_ADDR}:${SERVER_PORT}]`);
  } else {
    console.log(`Não foi possível acessar o diretório ${DIR_WATCH}.`);
  }
}
init();