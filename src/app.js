const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple kebab-case converter (handles camelCase, snake_case, spaces)
function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')    // fooBar -> foo-Bar
    .replace(/[_\s]+/g, '-')                 // foo_bar or "foo bar" -> foo-bar
    .toLowerCase();                           // -> foo-bar
}

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Auto-mount routers from src/routes
const routesDir = path.join(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  const walk = (dir, baseMount = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subMount = path.join(baseMount, toKebabCase(entry.name));
        walk(fullPath, subMount);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
        const name = path.basename(entry.name, path.extname(entry.name));
        const mountName = name === 'index' ? baseMount || '/' : path.join(baseMount, toKebabCase(name));
        // Normalize mount path to POSIX style and ensure it starts with '/'
        const mountPath = mountName.replace(/\\\\/g, '/').replace(/\/\\/g, '/');
        const finalMount = mountPath === '' ? '/' : (mountPath.startsWith('/') ? mountPath : `/${mountPath}`);
        try {
          // Require the router. For TypeScript or ESM setups this may need adjustment.
          const router = require(fullPath);
          // Router may be exported as module.exports = router or as default
          const actualRouter = router && router.default ? router.default : router;
          if (actualRouter && typeof actualRouter === 'function') {
            app.use(finalMount, actualRouter);
            console.log(`Mounted router: ${fullPath} -> ${finalMount}`);
          } else {
            console.warn(`File ${fullPath} did not export a router function; skipping.`);
          }
        } catch (err) {
          console.error(`Failed to mount router ${fullPath}:`, err.message);
        }
      }
    }
  };

  walk(routesDir);
} else {
  console.info('No routes directory found at src/routes — skipping auto-mount.');
}

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// If this file is run directly, start the server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
