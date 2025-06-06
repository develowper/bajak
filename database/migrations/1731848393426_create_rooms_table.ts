import { BaseSchema } from '@adonisjs/lucid/schema'
import Helper, { createRooms, isPG, pluck } from '../../app/services/helper_service.js'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.enum('game', Helper.GAMES)
      table.string('page', 50)
      table.enum('type', pluck(Helper.ROOMS, 'type'))
      table.integer('card_price').unsigned()
      table.string('title', 100)
      table.string('image', 100)
      table.bigint('starter_id').unsigned().defaultTo(0)
      table.bigint('clear_count').unsigned().defaultTo(0)
      table.integer('player_count').unsigned().defaultTo(0)
      table.integer('card_count').unsigned().defaultTo(0)
      table.integer('max_cards_count').unsigned()
      table.integer('max_user_cards_count').unsigned()
      table.integer('win_score').unsigned()
      if (isPG()) {
        table.jsonb('players').defaultTo(`'[]'::jsonb`)
      } else {
        table.json('players') // or table.text('players') for SQLite
      }
      table.boolean('is_active').defaultTo(true)
      table.timestamp('start_at').nullable()
      table.mediumint('max_seconds').unsigned()
      table.tinyint('rwp').unsigned().defaultTo(0)
      table.tinyint('commission_percent').unsigned().defaultTo(Helper.DABERNA.commissionPercent)
      table.tinyint('row_win_percent').unsigned().defaultTo(Helper.DABERNA.rowWinPercent)
      table.tinyint('win_percent').unsigned().defaultTo(Helper.DABERNA.winPercent)
      table.timestamps()
      table.tinyint('bot_percent').unsigned()
    })

    createRooms()
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
