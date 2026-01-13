'use client'

import React, { useState } from 'react'
import { configService, AppConfig } from '@/lib/config/config'
import { useRouter } from 'next/navigation'
import { ConfigContainer, Section } from './page.styles'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Label } from '@/components/ui/Label'

export default function AdminConfigPage() {
    const router = useRouter()
    // Initial state from current config
    const [config, setConfig] = useState<AppConfig>(configService.getConfig())

    const handleUpdate = () => {
        configService.updateConfig(config)
        alert('Configuration Updated! Refreshing...')
        // Force refresh to propagate changes (since we aren't using reactive store for config yet)
        router.refresh()
        window.location.reload()
    }

    const toggleFeature = (feat: keyof AppConfig['features']) => {
        setConfig(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [feat]: !prev.features[feat]
            }
        }))
    }

    return (
        <ConfigContainer>
            <h1>⚙️ Admin Configuration</h1>
            <p style={{ marginBottom: '24px' }}>Manage Feature Flags and Tiers dynamically.</p>

            <Section>
                <h3>Monetization Tier</h3>
                <Select
                    value={config.tier}
                    onChange={(val) => setConfig({ ...config, tier: val as AppConfig['tier'] })}
                    options={[
                        { value: 'FREE', label: 'Free' },
                        { value: 'PREMIUM', label: 'Premium' },
                        { value: 'PAID', label: 'Paid' }
                    ]}
                />
            </Section>

            <Section>
                <h3>Feature Flags</h3>
                <Label>
                    <span>Enable AI Chef</span>
                    <input
                        type="checkbox"
                        checked={config.features.aiChef}
                        onChange={() => toggleFeature('aiChef')}
                    />
                </Label>
                <Label>
                    <span>Premium Themes</span>
                    <input
                        type="checkbox"
                        checked={config.features.premiumThemes}
                        onChange={() => toggleFeature('premiumThemes')}
                    />
                </Label>
            </Section>

            <Button fullWidth onClick={handleUpdate}>Save Configuration</Button>
        </ConfigContainer>
    )
}
