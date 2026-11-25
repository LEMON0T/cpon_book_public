# Kuponfüzet – üzembe helyezés

1. **Supabase**: supabase.com → New project → SQL Editor → illeszd be a `supabase/schema.sql` tartalmát → Run.
   (Létrehozza a táblákat, az RLS szabályokat és a nyilvános `memories` bucketet.)
   Project Settings → API: másold ki a *Project URL*-t és az *anon public* kulcsot.
2. **Discord**: csatorna → Szerkesztés → Integrációk → Webhookok → Új webhook → URL másolása.
3. **Helyi futtatás**: `npm install`, `cp .env.example .env`, töltsd ki, `npm run dev`.
4. **Vercel**: töltsd fel GitHubra, vercel.com → Add New Project → Vite (automatikus). Environment Variables: az 5 `VITE_…` változó a `.env`-ből. Deploy.
5. **Telepítés a telefonra**: iPhone: Safari → Megosztás → Hozzáadás a főképernyőhöz. Android: Chrome → Telepítés.

Megjegyzés: a `VITE_` változók a böngészőben láthatók (PIN, webhook URL). Kettőtöknek elég, de ne oszd meg az oldal linkjét.
