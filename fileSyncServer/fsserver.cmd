@echo off

REM 437	United States
REM 850	Multilingual (Latin I)
REM 860	Portuguese
REM 65001	UTF-8
chcp 65001>nul

set FSSRV_ADDR=
set FSSRV_PORT=
set FSSRV_CDIR=

goto :init

:uso
    echo.
    echo O FileSync Server recebe arquivos enviados pelo cliente.
    echo.
    echo Uso: fsserver [-a ip] [-p porta] -d diretório
    echo.
    echo Opções:
    echo   -a   Endereço IP de escuta do servidor (valor padrão: 0.0.0.0)
    echo   -p   Porta de escuta (valor padrão: 3000)
    echo   -d   Diretório que receberá os arquivos enviados pelo FileSync Client
    echo   -?   Ajuda
    echo.
    echo Exemplo:
    echo   fsserver -a 0.0.0.0 -p 5858 -d ./sincronizacao
    goto :eof

:erra
    set FSSRV_ADDR=
    echo.
    echo Erro: IP não informado.
    echo.
    echo Informe o endereço de IP escuta do servidor!
    echo Exemplo:
    echo   -a 151.101.205.140
    goto :eof

:errd
    set FSSRV_CDIR=
    echo.
    echo Erro: Diretório não informado.
    echo.
    echo Informe o diretório para receber os arquivos do FileSync Client!
    echo Exemplo:
    echo   -d C:/sincronizar
    goto :eof

:errp
    set FSSRV_PORT=
    echo.
    echo Erro: Porta de escuta do servidor não informada.
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
        if not defined FSSRV_ADDR (
            if "%~2"=="" (
                goto :erra
            ) else ( 
                set FSSRV_ADDR=%~2
                shift
                shift
                goto :init
            )
        ) else (
            goto :errarg
        )
    )

    if /i "%~1"=="-d" (
        if not defined FSSRV_CDIR (
            if "%~2"=="" (
                goto :errd
            ) else ( 
                set FSSRV_CDIR=%~2
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
            set FSSRV_PORT=%~2
            shift
            shift
            goto :init
        )
    )

    if "%~1"=="" goto :exec

    shift
    goto :init

:exec
    if not defined FSSRV_CDIR goto :errd
    where /q node
    if errorlevel 1 (
        echo Node.js não encontrado. Verifique a sua instalação.
        goto :eof
    ) else (
        call node ./src/fsserver.js
    )