import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  // origin: '*',
  origin: [`https://${env.get('PWA_URL')}`, `https://${env.get('APP_URL')}`],
  // methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: ['request-room'],
  credentials: false,
  maxAge: 90,
})

export default corsConfig
