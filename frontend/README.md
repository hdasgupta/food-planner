# React frontend

Vite + React + React Router frontend designed for Vercel and Capacitor Android conversion.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the deployed Express API URL plus `/api`.

## Android

Install the Capacitor CLI in your development environment, then run:

```bash
npm install -D @capacitor/cli
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
