'use client'

import React from 'react'
import { Heading, Text } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { PageContainer, HeroSection } from './page.styles'
import Link from 'next/link'

export default function Home() {
  return (
    <PageContainer>
      <HeroSection>
        <Heading variant="h1">Welcome</Heading>
        <Text variant="body">Select an option below to get started.</Text>
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <Link href="/playground/d3" passHref legacyBehavior>
            <Button size="lg" variant="primary">Go to Playground</Button>
          </Link>
          <Link href="/settings" passHref legacyBehavior>
            <Button size="lg" variant="secondary">Settings</Button>
          </Link>
        </div>
      </HeroSection>
    </PageContainer>
  )
}
