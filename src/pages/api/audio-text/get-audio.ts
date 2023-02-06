import type { NextApiRequest, NextApiResponse } from 'next'

import { getAudioUrl } from '../../../utils/tools'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req.query.url) {
      res.status(400).json({ error: '缺少参数 url' })
      return
    }
    const audioUrl = await getAudioUrl(req.query.url as string)
    return res.status(200).json({ url: audioUrl })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : err })
  }
}
