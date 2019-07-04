#!/bin/bash

uso() {
  echo ""
  echo "O FileSync Server recebe arquivos enviados pelo cliente."
  echo ""
  echo "Uso: fsserver [-a ip] [-p porta] -d diretório"
  echo ""
  echo "Opções:"
  echo "  -a   Endereço IP de escuta do servidor (valor padrão: 0.0.0.0)"
  echo "  -p   Porta de escuta (valor padrão: 3000)"
  echo "  -d   Diretório que receberá os arquivos enviados pelo FileSync Client"
  echo "  -?   Ajuda"
  echo ""
  echo "Exemplo:"
  echo "  fsserver.sh -a 0.0.0.0 -p 5858 -d ./sincronizacao"
  exit
}

erra() {
  echo ""
  echo "Erro: IP não informado."
  echo ""
  echo "Informe o endereço de IP escuta do servidor!"
  echo "Exemplo:"
  echo "  -a 151.101.205.140"
  exit
}

errd() {
  echo ""
  echo "Erro: Diretório não informado."
  echo ""
  echo "Informe o diretório para receber os arquivos do FileSync Client!"
  echo "Exemplo:"
  echo "  -d C:/sincronizar"
  exit
}

errp() {
  echo ""
  echo "Erro: Porta de escuta do servidor não informada."
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

if [ -z "$_cdir" ]; then
  errd
fi

if ! [ -x "$(command -v node)" ]; then
  echo "Node.js não encontrado. Verifique a sua instalação."
  exit 1
else
  FSSRV_ADDR=$_addr FSSRV_PORT=$_port FSSRV_CDIR=$_cdir  node ./src/fsserver.js
fi
