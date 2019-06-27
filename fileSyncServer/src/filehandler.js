const net = require('net');
const fs = require('fs');
const crypto = require('crypto');

class FileHandler {

  // Retorna array com o nomes dos arquivos do diretorio
  static listaArquivos(dirPath) {
    return new Promise((resolve, reject)=> {
      try {
        fs.readdir(dirPath, (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(files);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Retorn o hash de um arquivo
  static criaHash(filePath) {
    return new Promise((resolve, reject) => {
      let hash = crypto.createHash('sha1');
      let stream = fs.createReadStream(filePath);

      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', err => reject(err));
    });
  }
}

module.exports = FileHandler;