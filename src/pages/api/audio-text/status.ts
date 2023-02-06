import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

import { AUDIO_STATUS_URL } from '../../../utils/constants'
import '../../../utils/config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req.query.id) {
      res.status(400).json({ error: '缺少参数 id' })
      return
    }
    console.log(process.env.VOLC_TOKEN)
    const response = await fetch(AUDIO_STATUS_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: process.env.VOLC_TOKEN,
      },
      body: JSON.stringify({
        appid: '4182311075',
        token: process.env.VOLC_TOKEN,
        cluster: 'volc_auc_common',
        id: req.query.id,
      }),
    })
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err })
  }
}
