'use client'

import React, { useState } from 'react'
import { configService } from '@/lib/config/config'
import { PageContainer, PremiumLock, LockIcon, UpgradeButton, ChefInterface, ResultArea } from './page.styles'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/TextArea'

export default function AIChefPage() {
  const config = configService.getConfig()
  const isEnabled = config.features.aiChef || config.tier === 'PREMIUM'

  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleGenerate = () => {
    setLoading(true)
    // Mock API call
    setTimeout(() => {
      setResult(`Here is a delicious recipe for "${prompt}":\n\n1. Mix ingredients...\n2. Cook at 200°C...\n3. Enjoy!`)
      setLoading(false)
    }, 1500)
  }

  return (
    <PageContainer>
      <h1>🤖 AI Chef</h1>
      <p>Generate unique recipes with the power of AI.</p>

      {!isEnabled ? (
        <PremiumLock>
          <LockIcon>🔒</LockIcon>
          <h2>Premium Feature</h2>
          <p>This feature is available only on the Premium plan.</p>
          <UpgradeButton href="/admin/config">Go to Admin Config to Upgrade</UpgradeButton>
        </PremiumLock>
      ) : (
        <ChefInterface>
          <TextArea
            placeholder="What do you want to cook today? e.g. 'Gluten-free pasta with mushrooms'"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ marginBottom: '16px' }}
          />
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGenerate}
            disabled={loading || !prompt}
          >
            {loading ? 'Cooking up magic...' : 'Generate Recipe'}
          </Button>

          {loading && <p style={{ textAlign: 'center', marginTop: '16px' }}>Starting AI Oven...</p>}

          {result && (
            <ResultArea>
              <h3>Generated Result:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{result}</pre>
            </ResultArea>
          )}
        </ChefInterface>
      )}
    </PageContainer>
  )
}
