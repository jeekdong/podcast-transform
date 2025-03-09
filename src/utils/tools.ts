export async function getAudioUrl(url: string) {
  if (url.includes('www.xiaoyuzhoufm.com/episode')) {
    // 小宇宙 fm 的链接
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://www.xiaoyuzhoufm.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    }
    const response = await fetch(url, { headers })
    const html = await response.text()
    // 正则匹配出 audio 的 url
    const audioUrl = html.match(
      /<meta property="og:audio" content="(.+?)"/
    )?.[1]
    const title = html.match(/<meta property="og:title" content="(.+?)"/)?.[1]
    console.log('audioUrl', html, audioUrl, title)
    return {
      audioUrl,
      title,
    }
  } else {
    return {
      audioUrl: url,
      title: '',
    }
  }
}

export async function readFile(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}
