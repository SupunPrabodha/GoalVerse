# GoalVerse Backend

Fast start for local development with no port conflicts and easy LAN access.

## Setup

1. Install deps

```powershell
cd "C:\Users\ASUS TUF\Desktop\New folder\backend"
npm install
```

2. Configure environment

- Copy `src/.env.example` to `src/.env` and set values as needed.
- If you don’t have MongoDB ready, you can leave `MONGODB_URI` unset; the API will still start for UI work.

3. Run

```powershell
npm run dev
```

The server binds to `0.0.0.0` and will try ports 4000..4004 to avoid `EADDRINUSE` conflicts. Logs will show the chosen port.

## Windows Firewall (LAN access)
To reach the API from your phone (same Wi‑Fi), allow inbound TCP on the chosen port (default 4000):

```powershell
netsh advfirewall firewall add rule name="GoalVerse API 4000" dir=in action=allow protocol=TCP localport=4000
```

Then from your phone open: `http://10.159.201.40:4000/api/health`

Replace `10.159.201.40` with your PC's IPv4 if it changes (`ipconfig`).
