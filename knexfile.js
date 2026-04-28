require('dotenv').config();

const baseConfig = {
  client: 'postgresql',
  migrations: {
    directory: './db/migrations',
  },
  seeds: {
    directory: './db/seeds',
  },
};

module.exports = {
  development: {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
  },
  test: {
    ...baseConfig,
    connection: process.env.DATABASE_URL_TEST,
    pool: { min: 1, max: 5 },
  },
  production: {
    ...baseConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
  },
};
