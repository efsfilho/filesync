#!/bin/bash

uso() {
  echo ""
  echo "O FileSync Client sincroniza todos os arquivos de um diretório com o servidor."
  echo ""
  echo "Uso: fsclient -a servidor [-p porta] -d diretório"
  echo ""
  echo "Opções:"
  echo "  -a   Endereço do servidor(FileSync Server)"
  echo "  -p   Porta do servidor(valor 3000 quando não informado)"
  echo "  -d   Diretório a ser sincronizado"
  echo "  -?   Ajuda"
  echo ""
  echo "Exemplo:"
  echo "  fsclient.sh -a 104.94.244.188 -p 5000 -d ./sincronizar"
  exit
}

erra() {
  echo ""
  echo "Erro: Endereço do servidor não informado."
  echo ""
  echo "Informe o endereço do FileSync Server!"
  echo "Exemplo:"
  echo "  -a 151.101.205.140"
  exit
}

errd() {
  echo ""
  echo "Erro: Diretório não informado."
  echo ""
  echo "Informe o diretório a ser sincronizado com o FileSync Server!"
  echo "Exemplo:"
  echo "  -d ./sincronizar"
  exit
}

errp() {
  echo ""
  echo "Erro: Porta do servidor não informada."
  echo ""
  echo "Informe a porta do FileSync Server!"
  echo "Exemplo:"
  echo "  -p 8000"
  exit
}

errarg() {
  echo ""
  echo "Erro: Argumento "$1 $2" já definido ou não reconhecido."
  echo ""
  uso
}

for arg in "$@"
do
  if [ "$arg" == "-?" ]; then
    uso
    exit
  fi
done

setarga() {
  if [ -z "$_addr" ]; then
    if [ "$2" != "" ]; then
      _addr="$2"
    else
      erra
    fi
  else
    errarg $1 $2
  fi
}

setargd() {
  if [ -z "$_cdir" ]; then
    if [ "$2" != "" ]; then
      _cdir="$2"
    else
      errd
    fi
  else
    errarg $1 $2
  fi
}

setargp() {
  if [ -z "$_port" ]; then
    if [ "$2" != "" ]; then
      _port="$2"
    else
      errp
    fi
  else
    errarg $1 $2
  fi
}

while [ "$1" != "" ]; do
  case ${1,,} in
    "-a")
      setarga $1 $2
      shift
      ;;

    "-d")
      setargd $1 $2
      shift
      ;;

    "-p")
      setargp $1 $2
      shift
      ;;
  esac
  shift
done

if [ -z "$_addr" ]; then
  erra
fi

if [ -z "$_cdir" ]; then
  errd
fi

if ! [ -x "$(command -v node)" ]; then
  echo "Node.js não encontrado. Verifique a sua instalação."
  exit 1
else
  FSCLI_ADDR=$_addr FSCLI_PORT=$_port FSCLI_CDIR=$_cdir  node ./src/fsclient.js
fi
