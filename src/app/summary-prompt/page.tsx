'use client'

import { useState } from 'react'
import {
  Button,
  Box,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
  useToast,
} from '@chakra-ui/react'

import { SunIcon } from '@chakra-ui/icons'

const MAX_SINGLE_TEXT_LENGTH = 1400

const START_TEXT = '（文章段落没有发送完，请只回复"好的"）\n'
const END_TEXT = '（文章发送完了，包括之前发送的所有内容概述这篇文章的内容）\n'

const PRE_TEXT =
  '下面是一篇很长的文章，接下来我会分多次发送给你内容，等我发完之后会问你一些问题，注意后面每段文字开始括号里的内容，按照括号里的指示回复'

function Page() {
  const toast = useToast()
  const [text, setText] = useState('')
  const [splitText, setSplitText] = useState<string[]>([PRE_TEXT])
  const [isCopied, setIsCopied] = useState<Boolean[]>([])

  const handleText = (_text: string) => {
    setSplitText([])
    // 将文本分为多个段落，1400长度为一段
    let _splitText = []
    let i = 0
    while (i < text.length) {
      _splitText.push(_text.slice(i, i + MAX_SINGLE_TEXT_LENGTH))
      i += MAX_SINGLE_TEXT_LENGTH
    }
    _splitText = _splitText.map((item, index) => {
      if (index !== _splitText.length - 1) {
        return START_TEXT + item
      } else {
        return END_TEXT + item
      }
    })
    setSplitText([PRE_TEXT, ..._splitText])
  }

  const handleCopy = async (index: number) => {
    await navigator.clipboard.writeText(splitText[index])
    toast({
      title: '复制成功',
      status: 'success',
      duration: 2000,
      position: 'top',
      isClosable: true,
    })
    setIsCopied((pre) => {
      const _pre = [...pre]
      _pre[index] = true
      return _pre
    })
  }

  return (
    <>
      <Box mt="10" textAlign="center">
        <Heading>ChatGpt 文章输入生成器</Heading>
        <Textarea
          w="60%"
          h="48"
          mt="10"
          resize="vertical"
          value={text}
          size="lg"
          onChange={(e) => {
            setText(e.target.value)
          }}
          placeholder="输入你需要让 ChatGpt 阅读的文章"
        />
        <Box mt="12">
          <Button
            leftIcon={<SunIcon />}
            variant="primary"
            size={'lg'}
            loadingText="创建中..."
            onClick={handleText.bind(null, text)}
          >
            生成输入
          </Button>
        </Box>
        {splitText.length > 1 && (
          <Box mt="12" textAlign="center" pb="20">
            <Card w="60%" display="inline-flex">
              <CardHeader>
                <Heading size="md">ChatGpt 输入</Heading>
              </CardHeader>
              <CardBody>
                <Stack divider={<StackDivider />} spacing="4">
                  {splitText.map((item, index) => (
                    <Box key={index}>
                      <Text
                        textAlign="left"
                        pt="2"
                        fontSize="sm"
                        noOfLines={[3, 4, 5]}
                      >
                        {item}
                      </Text>
                      <Button
                        mt="2"
                        variant={isCopied[index] ? 'outlined' : 'primary'}
                        float="right"
                        onClick={() => {
                          handleCopy(index)
                        }}
                      >
                        {isCopied[index] ? '已复制' : '复制'}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Box>
        )}
      </Box>
    </>
  )
}

export default Page
