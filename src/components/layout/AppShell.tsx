'use client'

import React from 'react'
import { Header } from './Header'
import { MainWrapper, Content } from './AppShell.styles'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper>
      <Header />
      <Content>
        {children}
      </Content>
    </MainWrapper>
  )
}
