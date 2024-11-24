// Structure des émojis avec mots-clés
export const emojiCategories = {
    smileys: [
        { emoji: '😀', keywords: ['sourire', 'heureux', 'content'] },
        { emoji: '😃', keywords: ['sourire', 'grand', 'content'] },
        { emoji: '😄', keywords: ['sourire', 'joie', 'content'] },
        { emoji: '😁', keywords: ['rire', 'dents', 'joie'] },
        { emoji: '😆', keywords: ['rire', 'content', 'joie'] },
        { emoji: '😅', keywords: ['sourire', 'sueur', 'nerveux'] },
        { emoji: '😂', keywords: ['pleurer', 'rire', 'hilarant'] },
        { emoji: '🤣', keywords: ['mort', 'rire', 'hilarant'] },
        { emoji: '😊', keywords: ['sourire', 'timide', 'joie'] },
        { emoji: '😇', keywords: ['ange', 'sourire', 'innocent'] },
    ],
    animals: [
        { emoji: '🐶', keywords: ['chien', 'animal', 'mignon'] },
        { emoji: '🐱', keywords: ['chat', 'animal', 'mignon'] },
        { emoji: '🐭', keywords: ['souris', 'animal', 'petit'] },
        // Ajoutez d'autres émojis ici...
    ],
    // Autres catégories...
};

// Fonction de recherche d'émojis
export function filterEmojis(query) {
    query = query.toLowerCase();
    const filteredEmojis = [];

    for (const category in emojiCategories) {
        emojiCategories[category].forEach(({ emoji, keywords }) => {
            if (keywords.some(keyword => keyword.includes(query))) {
                filteredEmojis.push(emoji);
            }
        });
    }

    return filteredEmojis;
}
