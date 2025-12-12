'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MockService, Recipe } from '@/lib/mock/mockService'
import { Container, BackLink, RecipeHeader, DetailSection, List } from './page.styles'
import { Heading } from '@/components/ui/Typography'

export default function RecipeDetail() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      MockService.getRecipes().then(recipes => {
        const found = recipes.find(r => r.id === id)
        setRecipe(found || null)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) return <div>Loading recipe...</div>
  if (!recipe) return <div>Recipe not found</div>

  return (
    <Container>
      <BackLink href="/">&larr; Back to Recipes</BackLink>

      <RecipeHeader>
        <Heading variant="h1" style={{ marginBottom: '16px' }}>{recipe.title}</Heading>
        <p>{recipe.description}</p>
      </RecipeHeader>

      <DetailSection>
        <Heading variant="h2" style={{
          fontSize: '1.5rem',
          marginBottom: '16px',
          borderBottom: '2px solid #eee',
          paddingBottom: '8px'
        }}>Ingredients</Heading>
        <List>
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </List>
      </DetailSection>

      <DetailSection>
        <Heading variant="h2" style={{
          fontSize: '1.5rem',
          marginBottom: '16px',
          borderBottom: '2px solid #eee',
          paddingBottom: '8px'
        }}>Instructions</Heading>
        <List as="ol">
          {recipe.instructions.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </List>
      </DetailSection>
    </Container>
  )
}
