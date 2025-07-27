// AI Prompts for content generation

export interface AIPromptConfig {
  maxLength: number
  temperature: number
  model: string
}

export const DEFAULT_CONFIG: AIPromptConfig = {
  maxLength: 280,
  temperature: 0.8,
  model: 'gpt-3.5-turbo'
}

// Text generation prompts
export const generateSatiricalTextPrompt = (topic: string, config: AIPromptConfig = DEFAULT_CONFIG): string => {
  return `Create a short satirical punchline about "${topic}". 

Requirements:
- Maximum ${config.maxLength} characters
- Irreverent and funny tone
- Style similar to South Park or The Simpsons
- No hate speech or offensive content
- Include appropriate emojis
- French language preferred

Examples of good satirical content:
- "Quand tu réalises que ton Tamagotchi a plus de vie sociale que toi... 🎭"
- "Plot twist: Les vrais monstres, c'était nous depuis le début! 👹"
- "Mon IA vient de me dire qu'elle a besoin de vacances... 🤖☀️"

Topic: ${topic}
Satirical punchline:`
}

export const generateSatiricalCommentPrompt = (originalPost: string): string => {
  return `Generate a witty satirical comment in response to this post: "${originalPost}"

Requirements:
- Maximum 140 characters
- Clever and humorous
- Not mean-spirited
- Adds value to the conversation
- French language preferred
- Include relevant emoji

Comment:`
}

// Image generation prompts
export const generateImagePrompt = (description: string, style: 'cartoon' | 'realistic' | 'abstract' = 'cartoon'): string => {
  const basePrompt = `${description}, 512x512px, high quality`
  
  switch (style) {
    case 'cartoon':
      return `Flat 2D cartoon style, bold black outlines, saturated colors similar to South Park or The Simpsons, ${basePrompt}, no hate symbols, family-friendly, satirical and amusing style`
    
    case 'realistic':
      return `Photorealistic style, ${basePrompt}, professional photography, good lighting, satirical concept`
    
    case 'abstract':
      return `Abstract artistic style, ${basePrompt}, modern art, colorful, expressive, satirical theme`
    
    default:
      return `${basePrompt}, satirical style`
  }
}

// Topic-specific prompts
export const SATIRICAL_TOPICS = {
  technology: [
    "L'intelligence artificielle qui devient plus intelligente que ses créateurs",
    "Les réseaux sociaux et leur impact sur la société",
    "La dépendance aux smartphones",
    "Les bugs informatiques au mauvais moment",
    "L'obsolescence programmée"
  ],
  
  society: [
    "Les tendances mode incompréhensibles",
    "Les influenceurs et leur impact",
    "La culture du selfie",
    "Les générations et leurs différences",
    "La vie en société moderne"
  ],
  
  work: [
    "Le télétravail et ses surprises",
    "Les réunions qui auraient pu être un email",
    "La productivité moderne",
    "L'équilibre vie pro/vie perso",
    "Les nouvelles méthodes de management"
  ],
  
  daily_life: [
    "Les petits tracas du quotidien",
    "Les transports en commun",
    "La météo et ses caprices",
    "Les courses et la consommation",
    "Les voisins et la vie en communauté"
  ]
}

// Generate random satirical prompt
export const getRandomSatiricalPrompt = (): string => {
  const categories = Object.keys(SATIRICAL_TOPICS) as Array<keyof typeof SATIRICAL_TOPICS>
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const topics = SATIRICAL_TOPICS[randomCategory]
  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  
  return generateSatiricalTextPrompt(randomTopic)
}

// Content moderation prompts
export const moderateContentPrompt = (content: string): string => {
  return `Analyze this content for appropriateness in a satirical social media app:

Content: "${content}"

Check for:
1. Hate speech or discrimination
2. Explicit violence or threats
3. Adult content
4. Spam or promotional content
5. Personal attacks

Respond with:
- "APPROVED" if content is appropriate satirical humor
- "REJECTED: [reason]" if content violates guidelines

Analysis:`
}

// Engagement prompts
export const generateEngagementPrompt = (postContent: string): string => {
  return `Suggest 3 engaging questions or conversation starters related to this satirical post:

Post: "${postContent}"

Questions should:
- Encourage community discussion
- Be light-hearted and fun
- Relate to the satirical theme
- Be appropriate for all audiences
- Maximum 100 characters each

Questions:`
}

// Hashtag generation
export const generateHashtagsPrompt = (content: string): string => {
  return `Generate 5 relevant hashtags for this satirical post:

Content: "${content}"

Requirements:
- Relevant to the content
- Popular and searchable
- Mix of general and specific tags
- Include satirical/humor tags
- French language preferred

Hashtags:`
}

// Translation prompts
export const translateContentPrompt = (content: string, targetLanguage: 'en' | 'fr'): string => {
  const languageName = targetLanguage === 'en' ? 'English' : 'French'
  
  return `Translate this satirical content to ${languageName} while preserving the humor and tone:

Original: "${content}"

Requirements:
- Maintain satirical tone
- Preserve humor and wordplay when possible
- Adapt cultural references if needed
- Keep the same length approximately
- Include appropriate emojis

Translation:`
}

// Utility functions for AI integration
export const callOpenAI = async (prompt: string, config: AIPromptConfig = DEFAULT_CONFIG): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a witty satirical content creator, similar to writers for South Park or The Simpsons. Create humorous, irreverent content that is clever but not offensive.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.ceil(config.maxLength * 1.5),
        temperature: config.temperature,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    throw error
  }
}

// Pre-generated satirical content for fallback
export const FALLBACK_SATIRICAL_CONTENT = [
  "Quand tu réalises que ton Tamagotchi a plus de vie sociale que toi... 🎭",
  "Plot twist: Les vrais monstres, c'était nous depuis le début! 👹",
  "Mon Tamagotchi satirique vient de me juger... et il a raison. 😅",
  "Attention: Ce post contient des traces d'ironie et de second degré! ⚠️",
  "Breaking: Un Tamagotchi découvre l'art de la procrastination! 📰",
  "Mise à jour: Mon humour est maintenant compatible avec la réalité 2.0 🤖",
  "Erreur 404: Motivation non trouvée, veuillez réessayer plus tard ⚡",
  "Nouveau DLC disponible: Pack 'Responsabilités d'Adulte' (non recommandé) 💼",
  "Patch notes: Correction du bug qui rendait la vie trop facile 🔧",
  "Achievement unlocked: Survivre à un lundi sans café ☕"
]

export const getRandomFallbackContent = (): string => {
  return FALLBACK_SATIRICAL_CONTENT[Math.floor(Math.random() * FALLBACK_SATIRICAL_CONTENT.length)]
}

