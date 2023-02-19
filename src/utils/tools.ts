export async function getAudioUrl(url: string) {
  if (url.includes('www.xiaoyuzhoufm.com/episode')) {
    // 小宇宙 fm 的链接
    const response = await fetch(url)
    const html = await response.text()
    // 正则匹配出 audio 的 url
    const audioUrl = html.match(
      /<meta property="og:audio" content="(.+?)"/
    )?.[1]
    const title = html.match(/<meta property="og:title" content="(.+?)"/)?.[1]
    console.log('audioUrl', audioUrl, title)
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
