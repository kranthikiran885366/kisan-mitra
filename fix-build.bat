@echo off
echo Cleaning build artifacts...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
del pnpm-lock.yaml 2>nul

echo Installing dependencies...
npm install

echo Building project...
npm run build

echo Build fix complete!
pause