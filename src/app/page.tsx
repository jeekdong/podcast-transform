'use client'

import { useRouter } from 'next/navigation'
import { Button, Container, HStack } from '@chakra-ui/react'

export default function Home({}) {
  const router = useRouter()

  return (
    <div className="w-full h-[100vh]">
      <Container
        display="flex"
        justifyContent="center"
        alignItems="center"
        h="full"
      >
        <HStack>
          <Button
            size="lg"
            variant="primary"
            onClick={() => {
              router.push('/submit')
            }}
          >
            创建任务
          </Button>
          <Button
            size="lg"
            variant="primary"
            onClick={() => {
              router.push('/query')
            }}
          >
            查询任务
          </Button>
          <Button
            size="lg"
            variant="primary"
            onClick={() => {
              router.push('/view')
            }}
          >
            浏览
          </Button>
        </HStack>
      </Container>
    </div>
  )
}
