'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useConfig } from '@/providers/ConfigProvider'
import { MockService, Recipe } from '@/lib/mock/mockService'
import { Heading, Text } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { PageContainer, HeroSection, RecipeGrid } from './page.styles'

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const { t } = useTranslation()
  const { config } = useConfig()

  useEffect(() => {
    MockService.getRecipes(config.language).then(setRecipes)
  }, [config.language])

  return (
    <PageContainer>
      <HeroSection>
        <Heading variant="h1">{t('common.welcome')}</Heading>
        <Text variant="body">{t('common.subtitle')}</Text>
        <Button size="lg" variant="primary">Browse Collection</Button>
      </HeroSection>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Heading variant="h2">{t('common.latestRecipes')}</Heading>
        </div>

        <RecipeGrid>
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </RecipeGrid>
      </div>
    </PageContainer>
  )
}
