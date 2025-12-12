'use client'

import React from 'react'
import { useConfig } from '@/providers/ConfigProvider'
import { useTranslation } from '@/hooks/useTranslation'
import { PageContainer, Section, Title, FormGroup } from './page.styles'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'

export default function Settings() {
  const { config, updateConfig } = useConfig()
  const { t } = useTranslation()

  return (
    <PageContainer>
      <Section>
        <Title>{t('settings.title')}</Title>

        <FormGroup>
          <Label>{t('settings.selectLanguage')}</Label>
          <Select
            value={config.language}
            onChange={(val) => updateConfig({ language: val as 'en' | 'he' })}
            options={[
              { value: 'en', label: 'English' },
              { value: 'he', label: 'עברית' }
            ]}
          />
        </FormGroup>

        <FormGroup>
          <Label>Theme Mode</Label>
          <Select
            value={config.mode || 'light'}
            onChange={(val) => updateConfig({ mode: val as 'light' | 'dark' })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' }
            ]}
          />
        </FormGroup>
      </Section>
    </PageContainer>
  )
}
