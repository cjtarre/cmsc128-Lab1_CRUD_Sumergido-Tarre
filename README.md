### Preliminary
Create a `.env` file in `/backend` with `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_KEY`) to ensure that backend fetches data properly.
___
### 1. Run `npm install` in `/backend` and `/frontend` terminals to install the related dependencies:  
- `express`: handles app routing, process incoming HTTP requests, and sends responses back
- `cors`: ensures frontend (Vite/React) can communicate with backend
- `dotenv`: loads environment variables from `.env` file into Node's `process.env`
- `@supabase/supabase-js`: official JavaScript client library to Supabase
- `axios`: acts as the HTTP client that communicates with the local backend server (which then talks to Supabase)
___
### 2. To start the backend server:
```bash
node app.js
```
or
```bash
npm start
```

### Database Schema/ERD
![A relational schema hosted in Supabase managing a many-to-many (M-M) relationship between tasks and tags.](database_erd.png)