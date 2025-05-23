import { BaseSchema } from '@adonisjs/lucid/schema'
import { createUsers } from '#services/helper_service'

export default class extends BaseSchema {
  protected tableName = 'user_financials'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table
        .bigInteger('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('balance').defaultTo(0)
      table.string('card', 20).nullable().defaultTo(null)
      table.string('sheba', 40).nullable().defaultTo(null)
      table.timestamps()
      table.datetime('last_charge').nullable()

      createUsers()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
