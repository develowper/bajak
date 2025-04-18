import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: '*',
  // origin: ['https://pwa.soheilmarket.ir', '127.0.0.1:3298'],
  // methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: ['request-room'],
  credentials: false,
  maxAge: 90,
})

export default corsConfig
