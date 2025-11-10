@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: install-java.bat
:: Instala um JDK via winget e define JAVA_HOME e PATH (tenta definir em nível máquina se executado como Administrador).
:: Uso: install-java.bat [<package-id-ou-nome>]

echo ================================
echo Instalador de Java (winget)
echo ================================

:: Verifica se winget está disponível
where winget >nul 2>&1
if errorlevel 1 (
  echo ERRO: winget nao foi encontrado neste sistema.
  echo Instale o App Installer / winget pela Microsoft Store e execute novamente.
  pause
  exit /b 1
)

:: Verifica se tem privilégios de administrador (necessário para alterar variáveis em nivel MACHINE)
net session >nul 2>&1
if errorlevel 1 (
  set "IS_ADMIN=0"
) else (
  set "IS_ADMIN=1"
)

:: Função de tentativa de instalacao
set "PKG_ARG=%~1"
if not "%PKG_ARG%"=="" (
  echo Tentando instalar pacote/ID: %PKG_ARG%
  winget install --id %PKG_ARG% -e --accept-package-agreements --accept-source-agreements -h
  if errorlevel 1 (
    echo Falha ao instalar %PKG_ARG% via winget.
    pause
    exit /b 1
  )
) else (
  echo Nenhum pacote passado como argumento. Tentando instalar um JDK conhecido automaticamente.
  set "FOUND=0"
  for %%N in ("Temurin" "Microsoft OpenJDK" "Zulu" "AdoptOpenJDK" "Amazon Corretto" "OpenJDK") do (
    echo Tentando: %%~N
    winget install --name "%%~N" -e --accept-package-agreements --accept-source-agreements -h
    if not errorlevel 1 (
      set "FOUND=1"
      goto :installed
    )
  )
  :installed
  if "%FOUND%"=="0" (
    echo Nao foi possivel instalar automaticamente um JDK conhecido.
    echo Execute este script passando um ID ou nome valido do pacote, por exemplo:
    echo   install-java.bat Microsoft.OpenJDK.17
    pause
    exit /b 1
  )
)

:: Descobre o JAVA_HOME via PowerShell usando o caminho do executavel java
for /f "usebackq delims=" %%J in (`powershell -NoProfile -Command "try { $p=(Get-Command java -ErrorAction Stop).Source; (Get-Item $p).Directory.Parent.FullName } catch { Write-Output '' }"`) do set "JAVA_HOME=%%~J"

if "%JAVA_HOME%"=="" (
  echo Nao foi possivel detectar o java instalado usando 'where java'/'Get-Command java'.
  echo Verifique se o JDK foi instalado corretamente e se o comando 'java' esta no PATH.
  pause
  exit /b 1
)

echo Java instalado em: %JAVA_HOME%

:: Define a variavel de ambiente
if "%IS_ADMIN%"=="1" (
  echo Definindo JAVA_HOME em nivel MACHINE...
  setx JAVA_HOME "%JAVA_HOME%" /M >nul
  if errorlevel 1 (
    echo Aviso: falha ao setar JAVA_HOME em nivel MACHINE com setx.
  ) else (
    echo JAVA_HOME definido em nivel MACHINE.
  )
  echo Atualizando PATH (adicionando %JAVA_HOME%\bin) em nivel MACHINE...
  :: Obtem PATH atual do registro para evitar truncamento por usar %PATH% do processo
  for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','Machine')"`) do set "MACHINE_PATH=%%~P"
  if defined MACHINE_PATH (
    echo Definindo PATH machine...
    set "NEW_PATH=%%MACHINE_PATH%%;%JAVA_HOME%\bin"
    :: Usa setx para salvar (atenção: setx tem limite de tamanho para PATH)
    setx PATH "%NEW_PATH%" /M >nul
    if errorlevel 1 echo Aviso: falha ao atualizar PATH em nivel MACHINE.
  ) else (
    echo Nao foi possivel ler PATH de nivel MACHINE. Tentando atualizar PATH do usuario.
    setx PATH "%PATH%;%JAVA_HOME%\bin" >nul
  )
) else (
  echo Nao executado como Administrador: definindo variaveis no nivel usuario.
  setx JAVA_HOME "%JAVA_HOME%" >nul
  if errorlevel 1 echo Aviso: falha ao setar JAVA_HOME no nivel de usuario.
  echo Atualizando PATH do usuario (adicionando %JAVA_HOME%\bin)...
  setx PATH "%PATH%;%JAVA_HOME%\bin" >nul
  if errorlevel 1 echo Aviso: falha ao atualizar PATH do usuario.
)

echo.
echo Pronto. Pode ser necessario fechar e reabrir terminais/prompt para as variaveis entrarem em vigor.
echo Verifique com:
echo   echo %%JAVA_HOME%%
echo   java -version
pause

endlocal
