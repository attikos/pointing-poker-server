'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')
const Url     = require('url-parse')

const isDev        = Env.get('NODE_ENV') === 'development';
const DATABASE_URL = new Url(Env.get('DATABASE_URL'));

module.exports = {
  /*
  | Default Connection
  */
  connection: Env.get('DB_CONNECTION', 'pg'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  | npm i --save sqlite3
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  | Here we define connection settings for MySQL database.
  | npm i --save mysql
  */
  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  | npm i --save pg
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', DATABASE_URL.hostname),
      port: Env.get('DB_PORT', DATABASE_URL.port),
      user: Env.get('DB_USER', DATABASE_URL.username),
      password: Env.get('DB_PASSWORD', DATABASE_URL.password),
      database: Env.get('DB_DATABASE', DATABASE_URL.pathname.substr(1)),
      sslmode: Env.get('PGSSLMODE'),
      ...( isDev ? {} : { ssl: { rejectUnauthorized: !true } } ),
    },
  },
}
