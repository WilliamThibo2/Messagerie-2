// Liste complète des émojis par catégorie avec leurs mots-clés pour la recherche
const emojiData = {
    smileys: [
        { emoji: '😀', keywords: ['sourire', 'content', 'heureux'] },
        { emoji: '😂', keywords: ['rire', 'lol', 'mdr'] },
        { emoji: '😍', keywords: ['amour', 'coeur', 'adorer'] },
        { emoji: '😢', keywords: ['triste', 'pleurer', 'émotions'] },
        { emoji: '😡', keywords: ['colère', 'furieux', 'énervé'] },
    ],
    animals: [
        { emoji: '🐶', keywords: ['chien', 'animal', 'compagnon'] },
        { emoji: '🐱', keywords: ['chat', 'animal', 'mignon'] },
        { emoji: '🦁', keywords: ['lion', 'sauvage', 'roi'] },
    ],
    food: [
        { emoji: '🍎', keywords: ['pomme', 'fruit', 'rouge'] },
        { emoji: '🍕', keywords: ['pizza', 'nourriture', 'italien'] },
    ],
};

// Fonction pour rechercher des émojis en fonction d'une requête
function searchEmojis(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const category in emojiData) {
        emojiData[category].forEach(item => {
            // Recherche dans les mots-clés et le caractère de l'émoji
            if (
                item.keywords.some(keyword => keyword.includes(lowerQuery)) ||
                item.emoji.includes(lowerQuery)
            ) {
                results.push(item.emoji);
            }
        });
    }

    return results;
}

// Fonction pour charger les émojis d'une catégorie
function loadEmojisByCategory(category) {
    return emojiData[category]?.map(item => item.emoji) || [];
}

// Export des fonctions
export { searchEmojis, loadEmojisByCategory };
