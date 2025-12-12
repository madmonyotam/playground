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
        🍳 Family Cookbook
      </Logo>
      <Nav>
        <NavLink href="/">{t('nav.home')}</NavLink>
        <NavLink href="/recipes">{t('nav.recipes')}</NavLink>
        <NavLink href="/create">{t('nav.addRecipe')}</NavLink>
        <NavLink href="/settings">{t('nav.settings')}</NavLink>
      </Nav>
      <MenuButton variant="ghost" onClick={toggleSidebar}>☰</MenuButton>
    </HeaderContainer>
  )
}
