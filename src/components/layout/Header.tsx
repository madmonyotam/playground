'use client'

import React from 'react'
import { useUIStore } from '@/lib/store/store'
import { useTranslation } from '@/hooks/useTranslation'
import { HeaderContainer, Logo, Nav, NavLink, MenuButton } from './Header.styles'

export function Header() {
  const { toggleSidebar } = useUIStore()
  const { t } = useTranslation()

  return (
    <HeaderContainer>
      <Logo href="/">
        Playground
      </Logo>
      <Nav>
        <NavLink href="/playground/d3">Playground</NavLink>
        <NavLink href="/settings">{t('nav.settings')}</NavLink>
      </Nav>
      <MenuButton variant="ghost" onClick={toggleSidebar}>☰</MenuButton>
    </HeaderContainer>
  )
}
