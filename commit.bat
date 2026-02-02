@echo off
echo === SCRIPT PARA COMMIT E PUSH AUTOMATICO ===
echo.

REM Adicionar todas as mudancas
git add .

REM Verificar se ha mudancas
git status

REM Fazer commit
set /p mensagem="Digite a mensagem do commit: "
git commit -m "%mensagem%"

REM Push para o GitHub
git push origin main

echo.
echo === PRONTO! Deploy atualizado no Render ===
pause
