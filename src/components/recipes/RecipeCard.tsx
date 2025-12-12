'use client';

import React from 'react';
import Link from 'next/link';
import { Heading, Text } from '@/components/ui/Typography';
import { Recipe } from '@/lib/mock/mockService';
import {
    StyledRecipeCard,
    CardImageWrapper,
    CardImage,
    CardOverlay,
    CardContent,
    MetaTags,
    Tag,
    AuthorRow,
    Avatar,
    AuthorName
} from './RecipeCard.styles';

interface RecipeCardProps {
    recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
            <StyledRecipeCard>
                <CardImageWrapper>
                    {recipe.imageUrl ? (
                        <CardImage src={recipe.imageUrl} alt={recipe.title} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#eee' }} />
                    )}
                    <CardOverlay />
                </CardImageWrapper>

                <CardContent>
                    <MetaTags>
                        <Tag>⏱ 45m</Tag>
                        <Tag>🌿 Vegetarian</Tag>
                    </MetaTags>

                    <Heading variant="h3" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                        {recipe.title}
                    </Heading>

                    <Text variant="small" style={{ marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {recipe.description}
                    </Text>

                    <AuthorRow>
                        <Avatar>GR</Avatar>
                        <AuthorName>By Grandma Rose</AuthorName>
                    </AuthorRow>
                </CardContent>
            </StyledRecipeCard>
        </Link>
    );
}
