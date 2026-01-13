'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useConfig } from '@/providers/ConfigProvider'
import { MockService, Recipe } from '@/lib/mock/mockService'
import { Heading, Text } from '@/components/ui/Typography'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { PageContainer, Header, Grid } from './page.styles'

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const { t } = useTranslation()
    const { config } = useConfig()

    useEffect(() => {
        // In a real app we might fetch all or paginate. 
        // MockService.getRecipes returns 'latest', let's stick with that or add a getAll if strictly needed,
        // but for now getRecipes is sufficient as per available mock service methods viewed earlier (or assumed).
        // Actually, I should double check MockService if needed, but getRecipes was used in home page.
        MockService.getRecipes(config.language).then(setRecipes)
    }, [config.language])

    return (
        <PageContainer>
            <Header>
                <Heading variant="h1">{t('nav.recipes')}</Heading>
                <Text variant="body">{t('common.subtitle')}</Text>
            </Header>

            <Grid>
                {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </Grid>
        </PageContainer>
    )
}
