import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'mysql' /* 'pg'*/,
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        // charset: 'utf8mb4',
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('PG_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE'),
      },
      // pool: {
      //   min: 2,
      //   max: 20,
      // },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      healthCheck: false,
      debug: false,
    },
  },
})

export default dbConfig
