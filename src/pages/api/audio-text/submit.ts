import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

import { AUDIO_SUBMIT_URL } from '../../../utils/constants'
import { getAudioUrl } from '../../../utils/tools'

import '../../../utils/config'

// const audioUrl = "https://files.jeekdong.cn/%E5%90%8C%E4%BA%BA%E8%A1%97.m4a";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = req.query.url
    // const type = req.query.type
    if (!url) {
      res.status(400).json({ error: '缺少参数 url' })
      return
    }
    // if (!type) {
    //   res.status(400).json({ error: '缺少参数 type' })
    //   return
    // }
    const { audioUrl } = await getAudioUrl(url as string)
    const response = await fetch(AUDIO_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.VOLC_TOKEN,
      },
      body: JSON.stringify({
        app: {
          appid: '4182311075',
          token: process.env.VOLC_TOKEN,
          cluster: 'volc_auc_common',
        },
        user: {
          uid: '1',
        },
        audio: {
          format: 'm4a',
          url: audioUrl,
        },
        additions: {
          use_itn: 'False',
          with_speaker_info: 'True',
        },
      }),
    })
    const data = await response.json()
    console.log('请求结果', data)
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err })
  }
}
