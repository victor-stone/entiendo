export function cleanMissedWords(target, oldArr, newArr) {
    // Combine, deduplicate, remove punctuation, and lowercase, preserving accented characters
    const targetSet = new Set(
        (target || []).map(w => w.replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().trim())
    );

    return Array.from(
        new Set(
            [...(oldArr || []), ...(newArr || [])]
                .map(w => w.replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().trim())
                .filter(Boolean)
                .filter(w => !targetSet.has(w))
        )
    );
}
