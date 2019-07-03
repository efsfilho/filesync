const fs = require('fs');
const path = require('path');
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
  // static criaHash(filePath) {
  //   return new Promise((resolve, reject) => {
  //     let hash = crypto.createHash('sha1');
  //     let stream = fs.createReadStream(filePath);

  //     stream.on('data', chunk => hash.update(chunk));
  //     stream.on('end', () => resolve(hash.digest('hex')));
  //     stream.on('error', err => reject(err));
  //   });
  // }

  // Retorna array com nomes e hash de cada arquivo
  static async montaInfo(files) {
    let struc = [];

    for (const file of files) {
      let hash  = await this.criaHash(file).catch(err => err);

      struc.push({
        filename: path.basename(file),
        hash: hash,
        status: 'new'
      });
    }
    return struc;
  }

  // Verifica existncia de diretorios/arquivos
  static verificaCaminho(dirPath) {
    return fs.existsSync(dirPath, err => {
      console.log(err);
    });
  }

  static carregaArquivo(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = FileHandler;