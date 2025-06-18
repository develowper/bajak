import axios from 'axios'
import Helper from '#services/helper_service'
import env from '#start/env'

export default class Eitaa {
  public static LOGS = [10668964]

  public static async sendMessage(
    chat_id: string | number,
    text: string,
    mode: string | null = null,
    reply: string | null = null,
    keyboard: any | null = null,
    disable_notification: boolean = false,
    topic: string | null = null
  ) {
    return Eitaa.creator('sendMessage', {
      chat_id: chat_id,
      text: text,
      parse_mode: mode,
      reply_to_message_id: reply,
      reply_markup: keyboard,
      disable_notification: disable_notification,
      message_thread_id: topic,
    })
  }

  static async creator(method: string, datas: any = {}) {
    const url =
      'https://eitaayar.ir/api/' + env.get('EITAA_BOT_TOKEN', 'YOUR-BOT-TOKEN') + '/' + method
    try {
      const res = await axios.post(url, datas, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      // console.log('**********res**********')
      // console.log(res)
    } catch (error) {
      // console.log(error)
    }
  }

  public static async logAdmins(msg: string, mode: any = null, topic: any = null) {
    for (let log of Eitaa.LOGS) await Eitaa.sendMessage(log, msg, mode, null, null, false, null)
    // return res
  }
}
