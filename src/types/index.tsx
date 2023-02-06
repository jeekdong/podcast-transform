export interface TextInfo {
  resp: Resp
  BaseResp: null
}

export interface Resp {
  id: string
  code: number
  message: string
  result_url: null
  text: string
  utterances: Utterance[]
  additions: RespAdditions
  podcastUrl?: string
  audioUrl?: string
  title?: string
}

export interface RespAdditions {
  duration: string
}

export interface Utterance {
  text: string
  start_time: number
  end_time: number
  definite: null
  words: Word[]
  additions: UtteranceAdditions
}

export interface UtteranceAdditions {
  speaker: string
  event: Event
}

export enum Event {
  Speech = 'speech',
}

export interface Word {
  text: string
  start_time: number
  end_time: number
  blank_duration: null
  pronounce: null
}
