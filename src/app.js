import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Recorre recursivamente y devuelve archivos .js
async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(res);
    } else if (entry.isFile() && res.endsWith('.js')) {
      yield res;
    }
  }
}

// Convierte la ruta de archivo en el path de montaje
function computeMountPath(routesRoot, filePath) {
  let rel = path.relative(routesRoot, filePath).replace(/\\/g, '/'); // normalize
  rel = rel.replace(/\.js$/, '');
  if (rel.endsWith('/index')) rel = rel.slice(0, -6);
  rel = '/' + rel;
  rel = rel.replace(/\/+/g, '/');
  if (rel === '/index' || rel === '/') return '/';
  if (rel.length > 1 && rel.endsWith('/')) rel = rel.slice(0, -1);
  return rel;
}

// Carga e intenta montar cada archivo de ruta
async function loadRoutes() {
  const routesRoot = path.join(__dirname, 'routes');
  try {
    await fs.access(routesRoot);
  } catch (err) {
    console.warn(`Routes directory not found at ${routesRoot}, skipping auto-route loading.`);
    return;
  }

  for await (const file of walk(routesRoot)) {
    try {
      const fileUrl = pathToFileURL(file).href;
      const mod = await import(fileUrl);

      const mountPath = computeMountPath(routesRoot, file);

      // Determinar qué se exportó (default, router o función)
      const exported = mod.default ?? mod.router ?? mod;

      if (!exported) {
        console.warn(`No export found in route file ${file}, skipping.`);
        continue;
      }

      // Si parece un Router (objeto/función con propiedades de express), hacer app.use
      const isRouterLike =
        ((typeof exported === 'function') && (exported.stack || exported.use || exported.handle)) ||
        ((typeof exported === 'object') && (exported.stack || exported.use || exported.handle));

      if (isRouterLike) {
        app.use(mountPath, exported);
        console.log(`Mounted router from ${file} at ${mountPath}`);
      } else if (typeof exported === 'function') {
        // Si es función, invocarla con (app, mountPath). Si devuelve router, montarlo.
        const maybeRouter = await exported(app, mountPath);
        if (maybeRouter && (maybeRouter.stack || maybeRouter.use || maybeRouter.handle)) {
          app.use(mountPath, maybeRouter);
          console.log(`Mounted returned router from ${file} at ${mountPath}`);
        } else {
          console.log(`Invoked function export in ${file} (assumed it registered routes)`);
        }
      } else if (typeof exported === 'object') {
        app.use(mountPath, exported);
        console.log(`Mounted object export from ${file} at ${mountPath}`);
      } else {
        console.warn(`Unsupported export type in ${file}, skipping.`);
      }
    } catch (err) {
      console.error(`Failed to load route ${file}:`, err);
    }
  }
}

async function start() {
  await loadRoutes();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
