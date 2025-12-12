export interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    imageUrl?: string;
    authorId: string;
    createdAt: number;
}

export const MOCK_RECIPES_EN: Recipe[] = [
    {
        id: '1',
        title: 'Classic Pancakes',
        description: 'Fluffy pancakes for a perfect breakfast.',
        ingredients: ['Flour', 'Milk', 'Eggs', 'Syrup'],
        instructions: ['Mix batter', 'Cook on griddle', 'Serve hot'],
        authorId: 'user1',
        createdAt: Date.now(),
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445'
    },
    {
        id: '2',
        title: 'Juicy Burger',
        description: 'All-American cheeseburger with fries.',
        ingredients: ['Beef Patty', 'Bun', 'Cheese', 'Lettuce'],
        instructions: ['Grill patty', 'Toast bun', 'Assemble'],
        authorId: 'user2',
        createdAt: Date.now(),
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
    }
];

export const MOCK_RECIPES_HE: Recipe[] = [
    {
        id: '1',
        title: 'שקשוקה חריפה אש',
        description: 'מתכון משפחתי עם עגבניות טריות וביצים',
        ingredients: ['עגבניות', 'ביצים', 'שום', 'פלפל חריף'],
        instructions: ['לבשל עגבניות', 'להוסיף ביצים', 'לכסות ולבשל'],
        authorId: 'user1',
        createdAt: Date.now(),
        imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa'
    }
];

export const MockService = {
    getRecipes: async (language: 'en' | 'he' = 'en'): Promise<Recipe[]> => {
        const recipes = language === 'he' ? MOCK_RECIPES_HE : MOCK_RECIPES_EN;
        return new Promise((resolve) => setTimeout(() => resolve(recipes), 500));
    },
    // Add more mock methods as needed
};
