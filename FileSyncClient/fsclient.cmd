@echo off

REM 437	United States
REM 850	Multilingual (Latin I)
REM 860	Portuguese
REM 65001	UTF-8

chcp 65001>nul

set FSCLI_ADDR=
set FSCLI_PORT=
set FSCLI_CDIR=

goto :init

:uso
    echo.
    echo  O FileSync Client sincroniza todos os arquivos de um diretório com o servidor.
    echo.
    echo  Uso: fsclient -a servidor [-p porta] -d diretório
    echo.
    echo  Opções:
    echo    -a   Endereço do servidor(FileSync Server)
    echo    -p   Porta do servidor(valor 3000 quando não informado)
    echo    -d   Diretório a ser sincronizado
    echo    -?   Ajuda
    echo.
    echo  Exemplo:
    echo    fsclient -a 104.94.244.188 -p 5000 -d ./sincronizar
    goto :eof

:erra
    set FSCLI_ADDR=
    echo.
    echo Erro: Endereço do servidor não informado.
    echo.
    echo Informe o endereço do FileSync Server!
    echo Exemplo:
    echo   -a 151.101.205.140
    goto :eof

:errd
    set FSCLI_CDIR=
    echo.
    echo Erro: Diretório não informado.
    echo.
    echo Informe o diretório a ser sincronizado com o FileSync Server!
    echo Exemplo:
    echo   -d C:/sincronizar
    goto :eof

:errp
    set FSCLI_PORT=
    echo.
    echo Erro: Porta do servidor não informada.
    echo.
    echo Informe a porta do FileSync Server!
    echo Exemplo:
    echo   -p 8000
    goto :eof

:errarg
    echo.
    REM echo %~1 não reconhecido
    echo Erro: Argumento %~1 %~2 já definido ou não reconhecido.
    echo.
    goto :uso

:init
    if /i "%~1"=="-?" goto :uso

    if /i "%~1"=="-a" (
        if not defined FSCLI_ADDR (
            if "%~2"=="" (
                goto :erra
            ) else ( 
                set FSCLI_ADDR=%~2
                shift
                shift
                goto :init
            )
        ) else (
            goto :errarg
        )
    )

    if /i "%~1"=="-d" (
        if not defined FSCLI_CDIR (
            if "%~2"=="" (
                goto :errd
            ) else ( 
                set FSCLI_CDIR=%~2
                shift
                shift
                goto :init
            )
        ) else (
            goto :errarg
        )
    )

    if /i "%~1"=="-p" (
        if "%~2"=="" (
            goto :errp
        ) else ( 
            set FSCLI_PORT=%~2
            shift
            shift
            goto :init
        )
    )

    if "%~1"=="" goto :exec

    shift
    goto :init

:exec
    if not defined FSCLI_ADDR goto :erra
    if not defined FSCLI_CDIR goto :errd
    where /q node
    if errorlevel 1 (
        echo Node.js não encontrado. Verifique a sua instalação.
        goto :eof
    ) else (
        call node ./src/fsclient.js
    )