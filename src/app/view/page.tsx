'use client'

import {
  useRef,
  DragEvent,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import {
  Container,
  Input,
  Box,
  Stack,
  Heading,
  Text,
  shouldForwardProp,
  chakra,
  HStack,
  Tooltip,
  Button,
  SlideFade,
} from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'

import { AttachmentIcon } from '@chakra-ui/icons'

import { readFile } from '../../utils/tools'
import type { TextInfo, Utterance } from '../../types/index'
import type { ExtractArrayItem } from '../../types/tools'

const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and non-Chakra props to be forwarded.
   */
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
})

const UPLOAD_TRANSITION_TIME = 300

// 时间精度(ms单位)
const TIME_STEP = 100

const COLOR = [
  'gray.800',
  'red.500',
  'green.500',
  'teal.500',
  'cyan.500',
  'pink.500',
]

function Page() {
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isDragEnter, setIsDragEnter] = useState(false)
  const [jsonData, setJsonData] = useState<TextInfo | null>(null)

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [fileName, setFileName] = useState('')
  const [delayShowUploadText, setDelayShowUploadText] = useState(false)

  const speakerColor = useRef<{
    [key: string]: string
  }>({})

  const showAudioText = useMemo(() => {
    return !!jsonData?.resp
  }, [jsonData])

  useEffect(() => {
    if (showAudioText) {
      setTimeout(() => {
        setDelayShowUploadText(true)
      }, UPLOAD_TRANSITION_TIME)
    }
  }, [showAudioText])

  const getTextFromAudioTime = (_trackList: { [key: number]: number }) => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', (e) => {
        setCurrentTrackIndex(
          _trackList[
            Math.ceil(((audioRef.current?.currentTime || 0) * 1000) / TIME_STEP)
          ]
        )
      })
    }
  }

  const getAudioTextUtils = useCallback((_data: TextInfo) => {
    const duration = (parseInt(_data.resp.additions.duration) || 0) / TIME_STEP

    const _trackList: {
      [key: number]: number
    } = {}
    let currentIndex = 0
    const textList = _data?.resp.utterances || []
    for (let i = 0; i < duration; i++) {
      if (!textList[currentIndex]) {
        break
      }
      if (textList[currentIndex]?.end_time > i * TIME_STEP) {
        _trackList[i] = currentIndex
      } else {
        currentIndex++
        _trackList[i] = currentIndex
      }
    }
    console.log(_trackList)
    getTextFromAudioTime(_trackList)
  }, [])

  useEffect(() => {
    if (jsonData) {
      getAudioTextUtils(jsonData)
    }
  }, [jsonData, getAudioTextUtils])

  const handleFile = async (file?: File) => {
    if (file) {
      setFileName(file.name)
      const res = await readFile(file)
      const _data = JSON.parse(res as string) as TextInfo
      setJsonData(_data)
    }
  }

  const handleUploadFile = async () => {
    if (inputRef.current?.files?.[0]) {
      await handleFile(inputRef.current?.files?.[0])
    }
  }

  const handleDragEnd = async (e: DragEvent<HTMLInputElement>) => {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault()
    console.log(e)
    // Use DataTransfer interface to access the file(s)
    const file = e.dataTransfer.files[0]
    await handleFile(file)
    setIsDragEnter(false)
  }

  const newUtterances = useMemo(() => {
    const _utterances =
      jsonData?.resp.utterances.map((item, index) => ({
        ...item,
        index: index,
        color: 'black',
      })) || []
    const newUtterances: (Utterance & {
      ori: typeof _utterances
    })[] = []
    let lastUtterances: ExtractArrayItem<typeof _utterances> | null = null
    _utterances.forEach((item) => {
      // 设置说话人文本颜色
      if (speakerColor.current[item.additions.speaker] === undefined) {
        speakerColor.current[item.additions.speaker] = COLOR.shift()!
      }
      item.color = speakerColor.current[item.additions.speaker]
      const isEnd = lastUtterances?.text.endsWith('。')
      if (!isEnd && lastUtterances) {
        const isEnglishEnd = /[a-zA-Z]/.test(
          lastUtterances.text[lastUtterances.text.length - 1]
        )
        newUtterances[newUtterances.length - 1] = {
          text: `${newUtterances[newUtterances.length - 1].text}${
            isEnglishEnd ? '. ' : ' '
          }${item.text}`,
          start_time: lastUtterances.start_time,
          end_time: item.end_time,
          definite: item.definite,
          words: [...lastUtterances.words, ...item.words],
          additions: item.additions,
          ori: [...newUtterances[newUtterances.length - 1].ori, item],
        }
        lastUtterances = item
        return
      }
      lastUtterances = item
      newUtterances.push({
        ...item,
        ori: [item],
      })
    })
    return newUtterances
  }, [jsonData])

  const changeAudioTime = (startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime / 1000
    }
  }

  return (
    <div>
      {/* 上传文件的位置 */}
      <Container centerContent mt="4">
        <ChakraBox
          borderColor="gray.300"
          borderStyle="dashed"
          borderWidth="2px"
          rounded="md"
          shadow="sm"
          role="group"
          _hover={{
            shadow: 'md',
          }}
          w={`${showAudioText ? '80vw' : '60'}`}
          maxW="xl"
          h={`${showAudioText ? '20' : '60'}`}
          display="inline-flex"
          alignItems="center"
          position="relative"
          bg={`${isDragEnter ? 'blackAlpha.100' : 'white'}`}
          layout
          p="2"
        >
          {!showAudioText ? (
            <ChakraBox layout layoutId="upload-content">
              <Stack p="6" textAlign="center" spacing="1">
                <ChakraBox
                  w="16"
                  rounded="md"
                  p="2"
                  bg="orange.200"
                  m="auto"
                  mb="4"
                  layout
                  layoutId="attachment-icon"
                >
                  <AttachmentIcon fontSize="2xl" />
                </ChakraBox>
                <Heading fontSize="lg" color="gray.700" fontWeight="bold">
                  拖拽语音文本文件到此处
                </Heading>
                <Text fontWeight="light">或者点击此处</Text>
              </Stack>
            </ChakraBox>
          ) : (
            <ChakraBox
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="space-around"
              layout
              layoutId="upload-content"
            >
              <HStack spacing="1">
                <ChakraBox
                  w="12"
                  rounded="md"
                  p="2"
                  bg="orange.200"
                  mr="2"
                  layout
                  layoutId="attachment-icon"
                  display="flex"
                  justifyContent="center"
                  zIndex="2"
                >
                  <AttachmentIcon fontSize="xl" />
                </ChakraBox>
                {delayShowUploadText && (
                  <>
                    <Tooltip label={fileName} placement="auto" hasArrow>
                      <Text noOfLines={1} w="80%">
                        {jsonData?.resp.title || fileName}
                      </Text>
                    </Tooltip>
                    <Button variant="tertiary" size="lg">
                      重新选择
                    </Button>
                  </>
                )}
              </HStack>
            </ChakraBox>
          )}

          <Input
            ref={inputRef}
            size="md"
            accept=".json"
            type="file"
            height="100%"
            width="100%"
            position="absolute"
            top="0"
            left="0"
            opacity="0"
            aria-hidden="true"
            onChange={handleUploadFile}
            fontSize="0"
            cursor="pointer"
            onDrop={handleDragEnd}
            onDragEnter={() => setIsDragEnter(true)}
            onDragLeave={() => setIsDragEnter(false)}
          />
        </ChakraBox>
      </Container>
      <SlideFade
        in={!!showAudioText}
        unmountOnExit
        transition={{ enter: { duration: 0.6 } }}
      >
        <Container
          w={`${showAudioText ? '80vw' : '60'}`}
          maxW="xl"
          mt="4"
          p="0"
          pb="32"
        >
          <Heading>{jsonData?.resp.title || fileName || '未选择文件'}</Heading>
          <Box py="2" lineHeight="2">
            {newUtterances &&
              newUtterances.map((item, index) => {
                return (
                  <Box p="2" key={index} bg="gray.100" rounded="md" mb="2">
                    {item.ori.map((_item) => {
                      return (
                        <Text
                          p="1"
                          key={_item.index}
                          display="inline"
                          wordBreak="break-word"
                          cursor="pointer"
                          fontSize="xl"
                          bg={`${
                            currentTrackIndex === _item.index
                              ? 'orange.200'
                              : 'none'
                          }`}
                          color={_item.color}
                          _hover={{
                            bg: 'gray.300',
                            rounded: 'md',
                            boxSizing: 'border-box',
                          }}
                          onClick={() => {
                            changeAudioTime(_item.start_time)
                          }}
                        >
                          {_item.text}
                        </Text>
                      )
                    })}
                    {item.text.endsWith('。') && <br />}
                  </Box>
                )
              })}
          </Box>
        </Container>
      </SlideFade>
      {jsonData?.resp.audioUrl && (
        <Container
          position="fixed"
          bottom="0"
          p="4"
          w="100vw"
          maxW="100vw"
          bg="gray.300"
          rounded="md"
          centerContent
        >
          <audio
            ref={audioRef}
            controls
            className="block w-full max-w-screen-md"
            src={jsonData?.resp.audioUrl}
          />
        </Container>
      )}
    </div>
  )
}

export default Page
