import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { Sequelize, DataTypes } from 'sequelize';

// Database Configuration
const sequelize = new Sequelize('epiz_28266684_custinfo', 'epiz_28266684', '7IvmExQmX3C', {
  host: 'sql302.infinityfree.com',
  dialect: 'mysql',
});

// Test Connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => console.error('Database connection failed:', err));

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();
  // Sample model using Sequelize
  const User = sequelize.define('Custinfo', {
    CustomerID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    CompanyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ContactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    City: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    PostalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'custinfo',
    timestamps: false, // Disable createdAt and updatedAt
  });

  // API endpoint to fetch users
  server.get('/api/users', async (req, res) => {
    try {
      const users = await User.findAll();
      console.log(users);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  });


  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
