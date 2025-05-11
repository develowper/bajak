import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import collect from 'collect.js'
import { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import { getSettings, range } from '#services/helper_service'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import Daberna from '#models/daberna'
import { isString } from 'node:util'
import redis from '@adonisjs/redis/services/main'
import db from '@adonisjs/lucid/services/db'
import { TransactionClient } from '@adonisjs/lucid/build/src/transaction_client/index.js'

// import { HttpContext } from '@adonisjs/http-server/build/standalone'
// @inject()
export default class Room extends BaseModel {
  private auth: any

  constructor() {
    super()
    this.auth = HttpContext.get()?.auth
  }
  @computed()
  public get lockKey() {
    return `${this.type}:lock`
  }

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare page: string

  @column()
  declare type: string

  @column()
  declare game: string

  @column()
  declare title: string

  @column()
  declare image: string

  @column()
  declare page: string

  @column(
    /*{
     serialize: (value: string) => JSON.parse(value) ?? [],
     consume: (value: any) => JSON.stringify(value)
  }*/ {
      serialize: (value) => {
        try {
          return typeof value === 'string' ? JSON.parse(value ?? '[]') : (value ?? [])
        } catch {
          return []
        }
      },
    }
  )
  declare players: any

  @column()
  declare starterId: number | null

  @column()
  declare botPercent: number
  @column()
  declare cardPrice: number
  @column()
  declare clearCount: number
  @column()
  declare playerCount: number
  @column()
  declare maxCardsCount: number
  @column()
  declare maxUserCardsCount: number
  @column()
  declare cardCount: number
  @column()
  declare winScore: number
  @column()
  declare rwp: number
  @column()
  @column()
  declare commissionPercent: number
  @column()
  declare winPercent: number
  @column({ serializeAs: 'rowWinPercent', columnName: 'row_win_percent' })
  declare rowWinPercent: number
  @column({
    serialize: (value: any) => value == 1,
  })
  declare isActive: boolean

  @column()
  declare maxSeconds: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: false, autoUpdate: false })
  declare startAt: DateTime | null

  @computed()
  public get startWithMe() {
    const user = this.auth?.user
    return this.starterId == user?.id
  }
  @computed()
  public get secondsRemaining() {
    if (!this.startAt) {
      return this.maxSeconds
    }

    const now = DateTime.now()
    const diffInSeconds = Math.round(this.startAt.diff(now, 'seconds').seconds)
    return diffInSeconds >= 0 ? diffInSeconds : this.maxSeconds
  }

  @computed()
  public get userCardCount() {
    return this.getUserCardCount()
  }

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  //
  public getUserCardCount() {
    const user = this.auth?.user
    const result: any = collect(
      typeof this.players === 'string' ? JSON.parse(this.players) : this.players
    ).first((item: any) => {
      return `${item.user_id}` == `${user?.id}`
    })
    return result?.card_count ?? 0
  }
  public async redisResetRoom() {
    const roomKey = this.type
    await redis.set(this.lockKey, '1', 'EX', 1)
    await redis.del(roomKey)
  }
  public async redisAddPlayer(userId, playerData) {
    const roomKey = this.type
    const luaScript = `
    if redis.call('EXISTS', KEYS[2]) == 1 then
      return "LOCKED"
    end
    local currentCount = redis.call('HLEN', KEYS[1])
    if currentCount < tonumber(ARGV[3]) then
      redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
      return "ADDED"
    else
      return "FULL"
    end
  `
    const result = await redis.eval(
      luaScript,
      2,
      roomKey,
      this.lockKey,
      userId,
      playerData,
      `${this.maxCardsCount}`
    )
    if (result != 'ADDED') console.log(result, this.type, userId, await redis.hlen(roomKey))
    // return true
    return result === 'ADDED'
  }

  public async pgAddPlayer(
    userId: number,
    username: string,
    cardCount: number,
    userRole: string,
    userIp: string,
    trx: TransactionClient
  ): Promise<boolean> {
    try {
      const result = await trx.rawQuery('SELECT * FROM rooms WHERE id = ? FOR UPDATE SKIP LOCKED', [
        this.id,
      ])

      const r = result.rows?.[0] ?? null

      if (!r) {
        console.log(`Room is locked `, username)
        return false
      }

      const res = await trx.rawQuery(
        `
          WITH updated AS (
            SELECT
              r.id,
              CASE
                WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(r.players) AS p
                  WHERE (p ->> 'user_id')::int = ?
                )
                  THEN (
                  SELECT jsonb_agg(
                           CASE
                             WHEN (p ->> 'user_id')::int = ? THEN
              jsonb_set(p, '{card_count}', to_jsonb(?::int), false)
            ELSE
              p
          END
                         )
                  FROM jsonb_array_elements(r.players) AS p
                )
                ELSE (
                  r.players || jsonb_build_object(
                    'user_id', ?::int,
                    'username', ?::text,
                    'card_count', ?::int,
                    'user_role', ?::text,
                    'user_ip', ?::text
                               )::jsonb
                  )
                END AS new_players
            FROM rooms r
            WHERE r.id = ?
          )
          UPDATE rooms r
          SET players = u.new_players
            FROM updated u
          WHERE r.id = u.id;
        `,
        [
          userId, // for EXISTS check
          userId, // for matching in jsonb_agg
          cardCount, // for updating existing card_count
          userId, // for jsonb_build_object
          username,
          cardCount,
          userRole,
          userIp,
          this.id, // room id
        ]
      )
      console.log(res)
      trx.commit()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  public async pgCreateGame(roomId: number): Promise<'reset' | 'locked'> {
    return await db.transaction(async (trx) => {
      // Try to lock the room row, skip if locked
      const { rows } = await trx.rawQuery('SELECT * FROM rooms WHERE id = ? FOR UPDATE', [roomId])

      if (!(rows?.length ?? null)) {
        return null // Another process is modifying this room (e.g., player being added)
      }

      // Safe to reset the room
      return await Daberna.makeGame(this)
    })
  }
  public async createGame() {
    // await redis.set(this.lockKey, '1')
    const game = await Daberna.makeGame(this)
    // await redis.del(this.type)
    // await redis.del(this.lockKey)
    return game
  }

  public async setUserCardsCount(
    count: number,
    us: User | null = null,
    ip: any,
    trx: TransactionClient
  ) {
    const user = us ?? this.auth?.user
    if (!user) return false
    let res: any[] = []
    return await this.pgAddPlayer(user.id, user.username, count, user.role, ip, trx)

    if (
      !(await this.redisAddPlayer(
        user.id,
        JSON.stringify({
          user_id: user.id,
          username: user.username,
          user_role: user.role,
          user_ip: ip,
          card_count: count,
        })
      ))
    )
      return false
    const parsed: any = this.players ?? []
    const beforeExists = collect(parsed).first((item: any) => `${item.user_id}` == `${user?.id}`)

    if (!beforeExists) {
      parsed.unshift({
        user_id: user.id,
        username: user.username,
        user_role: user.role,
        user_ip: ip,
        card_count: count,
      })
      res = parsed
      if (parsed.length > 0) this.starterId = user.id
    } else {
      res = collect(parsed)
        .map((item: any) => {
          if (item.user_id == user.id) item.card_count = count
          return item
        })
        .toArray()
    }

    this.players = JSON.stringify(res)
    this.$dirty.players = true
    return true
  }
  public async setUser(us: any = null, cmnd = 'add') {
    const user = us ?? this.auth?.user
    let res: any[] = []
    const parsed: any = this.players
    const beforeExists = collect(parsed).first(
      (item: any) => item.user_id == (user.id ?? user.user_id)
    )
    res = parsed
    // console.log(beforeExists, cmnd)
    if (!beforeExists && cmnd === 'add') {
      parsed.push({
        user_id: user.id,
        username: user.username,
        user_role: user.role,
      })
      res = parsed
    } else if (beforeExists && cmnd === 'remove') {
      res = collect(parsed)
        .filter((item: any) => item.user_id != (user.id ?? user.user_id))
        .toArray()
    }
    if (!res) return []
    this.cardCount = res.length
    this.playerCount = this.cardCount

    this.players = JSON.stringify(res)
    await this.save()

    return res
  }

  public static async addBot(
    room: Room,
    user: User | null = null,
    userCardCount: number | null = null
  ) {
    if (!room.isActive) return
    await db.transaction(async (trx) => {
      const players = room.players
      const beforeIds = collect(players).pluck('user_id').toArray()

      const botUser =
        user ??
        (await User.query()
          .whereNotIn('id', beforeIds)
          .where('is_active', true)
          .where('role', 'bo')
          .orderByRaw('RAND()')
          .first())

      if (!botUser /*|| beforeIds.includes(user?.id)*/) return
      let cardCount = userCardCount ?? [1, 2, 3][Math.floor(Math.random() * 3)]
      if (room.maxCardsCount - room.cardCount <= 0) return
      if (room.maxCardsCount - room.cardCount <= 3)
        cardCount = userCardCount ?? room.maxCardsCount - room.cardCount
      if (await room.setUserCardsCount(cardCount, botUser, null, trx)) {
        room.playerCount++
        botUser.playCount++
        room.cardCount += cardCount
        // room.playerCount = JSON.parse(room.players ?? '[]').length
        if (
          room.playerCount == 2 /* ||
        (room.playerCount >= 2 && room.secondsRemaining == room.maxSeconds)*/
        )
          room.startAt = DateTime.now().plus({ seconds: room.maxSeconds - 1 })

        await room.save()
        switch (room.cardPrice) {
          case 5000:
            botUser.card5000Count += cardCount
            botUser.todayCard5000Count += cardCount
            break
          case 10000:
            botUser.card10000Count += cardCount
            botUser.todayCard10000Count += cardCount
            break
          case 20000:
            botUser.card20000Count += cardCount
            botUser.todayCard20000Count += cardCount
            break
          case 50000:
            botUser.card50000Count += cardCount
            botUser.todayCard50000Count += cardCount
            break
        }

        await botUser.save()
        // console.log('*************')
        // console.log(room.type)
        // console.log(room.cardCount)
        // console.log(room.secondsRemaining)
        // console.log(room.players)

        emitter.emit('room-update', {
          type: room.type,
          cmnd: 'card-added',
          players: room.players,
          game_id: room.clearCount,
          card_count: room.cardCount,
          player_count: room.playerCount,
          start_with_me: room.startWithMe,
          seconds_remaining: room.playerCount > 1 ? room.secondsRemaining : room.maxSeconds,
          user_id: botUser?.id,
          username: botUser?.username,
          user_card_count: cardCount,
        })

        // await Daberna.startRooms([room])
      }
    })
  }
}
