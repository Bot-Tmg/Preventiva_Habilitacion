Preventiva_Habilitacion

This repository contains a Node.js/Express application.

Quick start (local)

1. Install dependencies

   npm install

2. Start the app

   npm start

The app listens on PORT environment variable (default 3000). A health endpoint is available at /health which returns a simple JSON status.

Docker

Build an image:

   docker build -t preventiva_habilitacion:latest .

Run the container:

   docker run -e PORT=3000 -p 3000:3000 preventiva_habilitacion:latest

Heroku (or any platform using Procfile)

This repository includes a Procfile with a web process. Ensure your app has a start script in package.json (e.g. "start": "node src/app.js"), then push to Heroku as usual:

   heroku create
   git push heroku main

Notes

- The updated src/app.js automatically mounts routers found in src/routes and converts their mount paths to kebab-case based on filenames. For example:
  - src/routes/index.js -> /
  - src/routes/userProfile.js -> /user-profile
  - src/routes/admin/settings.js -> /admin/settings

- If your routes use ESM or TypeScript with different export styles, you may need to adapt the loader in src/app.js.

If you need help adapting these files to your project structure, tell me what package.json and routes layout look like and I can refine them.