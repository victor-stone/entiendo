// there's a split() and the end -->
export default {
    "Casual": "Relaxed, conversational language used in informal settings.::Common in everyday interactions among friends or peers.::May include colloquialisms, contractions, or regionally relaxed forms.::Not intended to impress or persuade—just to communicate comfortably.".split('::'),
    "Neutral": "No strong emotional charge—neither formal nor slangy.::Commonly used in everyday speech across various settings (home, work, school).::Not marked by regional or street-specific vocabulary.::Functional and widely understandable, not meant to impress or provoke.".split('::'),
    "Street": "Gritty, raw, and informal—rooted in everyday street speech.::Often includes slang, vulgar language, or aggressive phrasing.::May reflect anger, rebellion, or subcultural identity.::Feels real and unfiltered but may not be appropriate in many settings.".split('::'),
    "Esoteric": "Obscure, insider, or culturally specific expressions.::Might be understood only by people familiar with certain local customs or in-groups.::Often playful, ironic, or layered in meaning.::Not intended for broad comprehension; part of its appeal is in its exclusivity.".split('::'),
    "Official": "Formal or semi-formal language suitable for institutions, rules, or serious settings.::Often seen in legal, administrative, or ceremonial contexts.::Structured, respectful, and designed for clarity and authority.::Rarely uses slang or emotional expression.".split('::')
}

export const TONE_DEFAULT = '';