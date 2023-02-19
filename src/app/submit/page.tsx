'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Text,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ScaleFade,
  useToast,
  HStack,
  Select,
} from '@chakra-ui/react'

import { LinkIcon, SunIcon } from '@chakra-ui/icons'
import { PodCastIcon } from '../../components/icons'

export default function Page({}) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [type, setType] = useState('xyzLink')
  const toast = useToast()
  const router = useRouter()

  const handleCreate = async () => {
    setIsCreating(true)
    const response = await fetch(
      `/api/audio-text/submit?url=${linkUrl}&type=${type}`,
      {
        method: 'get',
      }
    )
    const res = await response.json()
    if (res.resp.code === 1000) {
      toast({
        title: '创建成功',
        description: `任务ID: ${res.resp.id}`,
        status: 'success',
        duration: null,
        position: 'top',
        isClosable: true,
      })
      router.push('/query?id=' + res.resp.id)
    } else {
      toast({
        title: '创建失败',
        status: 'error',
        duration: null,
        position: 'top',
        isClosable: true,
      })
    }
    setIsCreating(false)
  }

  return (
    <Container
      h="100vh"
      maxW="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      p="0"
      m="0"
    >
      <Container h="40%">
        <Container centerContent>
          <HStack spacing="4">
            <PodCastIcon boxSize="10" color="whatsapp.500" />
            <Text fontSize="3xl" fontFamily="mono">
              ProdCast To Text
            </Text>
          </HStack>
          <InputGroup mt="6">
            <InputLeftElement pointerEvents="none" h="100%">
              {/* <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="类型"
              >
                <option value="normalLink">音频链接</option>
                <option value="xyzLink">小宇宙链接</option>
              </Select> */}
              <LinkIcon boxSize="4" color="whatsapp.500" />
            </InputLeftElement>
            <Input
              size="md"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </InputGroup>
        </Container>
        <ScaleFade in={!!linkUrl}>
          <Container centerContent mt="24">
            <Button
              leftIcon={<SunIcon />}
              colorScheme="whatsapp"
              variant="solid"
              size={'lg'}
              isLoading={isCreating}
              loadingText="创建中..."
              onClick={handleCreate}
            >
              创建任务！
            </Button>
          </Container>
        </ScaleFade>
      </Container>
    </Container>
  )
}
