'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { theme as baseTheme } from '@saas-ui/theme-glass'
import { theme as secondTheme } from '@hypertheme-editor/chakra-ui-theme'
import './globals.css'

const theme = extendTheme(baseTheme, {
  components: {
    // 修复 @saas-ui/theme-glass 一些样式的问题
    Alert: {
      baseStyle: {
        description: {
          color: 'white',
        },
      },
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh_cn">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </body>
    </html>
  )
}
