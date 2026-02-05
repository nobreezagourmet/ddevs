@echo off
set MONGODB_URI=mongodb+srv://nobreezagourmet:cluster0.8r4.mongodb.net/raffle-system?retryWrites=true^&^w=majority
node migrateSequentialId.js
pause
