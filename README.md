# FileSync

FileSync é um conjunto de ferramentas de sincronização de arquivos multiplataforma. O FileSync é composto por dois aplicativos, FileSync Client e o FileSync Server.
O FileSync Client é utilizado para monitorar alterações de arquivos em um direrório e enviar estas alterações para o servidor.
O FileSync Server mantém um diretório atualizado com os arquivos e as alterações recebidas do FileSync Client.

## Requisitos

Antes de executar o FileSync baixe e instale o [Node.js](https://nodejs.org/pt-br/download/) versão 8.12.0 ou mais recente.
OS: Windows/Linux

## Uso

O FileSync Server e o FileSync Client estão separados em duas pastas, cada aplicação possui o seu executável:

fsserver.sh ou fsserver.cmd do FileSync Server;

fsclient.sh ou fsclient.cmd do FileSync Client.

Obs.: No linux, certifique-se que os arquivos .sh possuem permissão de execução.

### FileSync Client

```bash
Uso: fsclient -a servidor [-p porta] -d diretório

Opções:
  -a   Endereço do servidor(FileSync Server)
  -p   Porta do servidor(valor 3000 quando não informado)
  -d   Diretório a ser sincronizado
  -?   Ajuda

Exemplo:
  fsclient -a 104.94.244.188 -p 5000 -d ./sincronizar
```

### FileSync Server

```bash
Uso: fsserver [-a ip] [-p porta] -d diretório

Opções:
  -a   Endereço IP de escuta do servidor (valor padrão: 0.0.0.0)
  -p   Porta de escuta (valor padrão: 3000)
  -d   Diretório que receberá os arquivos enviados pelo FileSync Client
  -?   Ajuda

Exemplo:
  fsserver -a 0.0.0.0 -p 5858 -d ./sincronizacao
```
