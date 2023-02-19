'use client'

import { useState, useMemo, useRef } from 'react'
import { motion, isValidMotionProp } from 'framer-motion'
import {
  Container,
  Text,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Button,
  chakra,
  shouldForwardProp,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  SlideFade,
  useToast,
  Badge,
  ButtonGroup,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'

import { CalendarIcon, Search2Icon, EditIcon } from '@chakra-ui/icons'

import { getAudioUrl } from '../../utils/tools'
import type { TextInfo } from '../../types'

const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and non-Chakra props to be forwarded.
   */
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
})

function Page() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const searchParams = useSearchParams()

  const initialRef = useRef<HTMLInputElement>(null)

  const [isSearching, setIsSearching] = useState(false)

  const [result, setResult] = useState<TextInfo | null>(null)

  const [editPodcastUrl, setEditPodcastUrl] = useState('')

  const showResultData = useMemo(() => {
    return !!result?.resp
  }, [result])

  const isTaskSuccess = () => {
    return result?.resp?.code === 1000
  }

  // 轮询任务结果
  const timerId = useRef<NodeJS.Timeout | null>(null)
  const handlePolling = () => {
    timerId.current = setInterval(() => {
      if (taskId) {
        handleQuery(taskId)
      }
    }, 5000)
  }

  const handleQuery = async (_taskId: string) => {
    try {
      setIsSearching(true)
      const response = await fetch(`/api/audio-text/status?id=${_taskId}`, {
        method: 'POST',
      })
      const res = await response.json()
      setIsSearching(false)
      setResult(res)
      if (res.resp.code === 1000) {
        // 清除轮询任务
        if (timerId.current) {
          clearInterval(timerId.current)
        }
        toast({
          title: '查询成功',
          status: 'success',
          duration: 5000,
          position: 'top',
          isClosable: true,
        })
      } else {
        // 没有timerId，开启轮询
        if (!timerId.current) {
          handlePolling()
        }
      }
    } catch {
      toast({
        title: '查询失败',
        status: 'error',
        duration: 5000,
        position: 'top',
        isClosable: true,
      })
    }
  }
  const [taskId, setTaskId] = useState(() => {
    if (searchParams.has('id')) {
      handleQuery(searchParams.get('id')!)
      return searchParams.get('id')!
    }
    return ''
  })

  const renderStatus = (code: number) => {
    switch (code) {
      case 1000:
        return <Badge colorScheme="green">已完成</Badge>
      case 2000:
        return <Badge colorScheme="cyan">处理中</Badge>
      case 2001:
        return <Badge colorScheme="gray">排队中</Badge>
      default:
        return <Badge colorScheme="red">失败</Badge>
    }
  }

  const [saveLoading, setSaveLoading] = useState(false)
  const editJsonData = async (podcastUrl: string) => {
    setSaveLoading(true)
    const { audioUrl, title } = await getAudioUrl(podcastUrl)
    setResult((pre) => {
      return pre
        ? { ...pre, resp: { ...pre.resp, audioUrl, podcastUrl, title } }
        : null
    })
    setSaveLoading(false)
    setEditPodcastUrl('')
    onClose()
  }

  const downloadJson = (fileName: string, json: object) => {
    const jsonStr =
      json instanceof Object ? JSON.stringify(json, null, 2) : json

    const url = window.URL || window.webkitURL || window
    const blob = new Blob([jsonStr])
    const saveLink = document.createElement('a')
    saveLink.href = url.createObjectURL(blob)
    saveLink.download = fileName
    saveLink.click()
  }

  return (
    <div>
      <ChakraBox
        h="100vh"
        w="100vw"
        maxW="100vw"
        display={!showResultData ? 'flex' : 'block'}
        justifyContent="center"
        alignItems="center"
        layout
        p="0"
        m="0"
        pt={!showResultData ? 0 : '24'}
      >
        <ChakraBox w="100%" h="40vh" layout>
          <Container centerContent>
            <Text fontSize="3xl" fontFamily="serif">
              查询任务
            </Text>
            <InputGroup mt="6">
              <InputLeftElement pointerEvents="none" h="100%">
                <CalendarIcon h="4" w="4" color="whatsapp.500" />
              </InputLeftElement>
              <Input
                size="md"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
              />
              {showResultData && (
                <InputRightElement w="24" cursor="pointer" h="100%">
                  <ChakraBox layout layoutId="search-button" w="36">
                    <Button
                      leftIcon={<Search2Icon />}
                      colorScheme="whatsapp"
                      variant="solid"
                      size={'lg'}
                      isLoading={isSearching}
                      loadingText="查询中..."
                      onClick={handleQuery.bind(null, taskId)}
                    >
                      查询！
                    </Button>
                  </ChakraBox>
                </InputRightElement>
              )}
            </InputGroup>
          </Container>
          <Container display="flex" justifyContent="center" mt="24">
            {!!taskId && !showResultData && (
              <ChakraBox layout layoutId="search-button" w="36">
                <Button
                  leftIcon={<Search2Icon />}
                  colorScheme="whatsapp"
                  variant="solid"
                  size={'lg'}
                  isLoading={isSearching}
                  loadingText="查询中..."
                  onClick={handleQuery.bind(null, taskId)}
                >
                  查询！
                </Button>
              </ChakraBox>
            )}
          </Container>
        </ChakraBox>
        <SlideFade
          in={!!showResultData}
          unmountOnExit
          transition={{ enter: { duration: 0.6 } }}
        >
          <TableContainer mt="-14vh">
            <Table>
              <Thead>
                <Tr>
                  <Th>任务ID</Th>
                  <Th>任务状态</Th>
                  <Th>任务进度</Th>
                  {isTaskSuccess() && <Th>附件</Th>}
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>{result?.resp?.id}</Td>
                  <Td>{renderStatus(result?.resp?.code!)}</Td>
                  <Td>{result?.resp?.message}</Td>
                  {isTaskSuccess() && (
                    <Td>
                      <ButtonGroup isAttached>
                        <Button
                          onClick={downloadJson.bind(
                            null,
                            `${taskId}-data.json`,
                            result!
                          )}
                          variant="primary"
                        >
                          下载
                        </Button>
                        <IconButton
                          aria-label="edit"
                          icon={<EditIcon />}
                          onClick={onOpen}
                        />
                      </ButtonGroup>
                    </Td>
                  )}
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </SlideFade>
      </ChakraBox>
      {/* edit modal */}
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(6px)" />
        <ModalContent>
          <ModalHeader>编辑文本信息</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>播客地址</FormLabel>
              <Input
                ref={initialRef}
                placeholder="请输入小宇宙播客/音频链接地址"
                value={editPodcastUrl}
                onChange={(e) => {
                  setEditPodcastUrl(e.target.value)
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="primary"
              mr={3}
              isLoading={saveLoading}
              onClick={editJsonData.bind(null, editPodcastUrl)}
            >
              保存
            </Button>
            <Button onClick={onClose}>取消</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Page
