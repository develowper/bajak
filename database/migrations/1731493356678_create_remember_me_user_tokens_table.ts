import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'remember_me_user_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements()
      table
        .bigInteger('tokenable_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 20)
      table.string('name').nullable()
      table.text('abilities').nullable()
      table.string('hash').notNullable().unique()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('last_used_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
