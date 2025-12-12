'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormContainer, FormGroup } from './page.styles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Label } from '@/components/ui/Label'

export default function CreateRecipe() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to save recipe (mock)
    console.log('Saving recipe:', formData)
    alert('Recipe created! (Mock)')
    router.push('/')
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Add New Recipe</h1>
      <FormContainer onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Recipe Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g. Grandma's Apple Pie"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Short description of the dish"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="ingredients">Ingredients (one per line)</Label>
          <TextArea
            id="ingredients"
            value={formData.ingredients}
            onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
            placeholder="2 apples&#10;1 cup flour"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="instructions">Instructions (one per line)</Label>
          <TextArea
            id="instructions"
            value={formData.instructions}
            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="1. Peel apples&#10;2. Mix dough"
          />
        </FormGroup>

        <Button type="submit">Create Recipe</Button>
      </FormContainer>
    </div>
  )
}
