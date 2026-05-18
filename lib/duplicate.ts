function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-zçğıöşü0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function bigrams(text: string): Set<string> {
  const words = normalize(text).split(" ");
  const set = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    set.add(words[i] + " " + words[i + 1]);
  }
  return set;
}

export function similarity(a: string, b: string): number {
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const bg of setA) {
    if (setB.has(bg)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

export function isDuplicate(
  newTitle: string,
  newContent: string,
  existingArticles: { title: string; content: string; id: string }[]
): { duplicate: boolean; matchId?: string; score: number } {
  for (const existing of existingArticles) {
    const titleSim = similarity(newTitle, existing.title);
    if (titleSim > 0.8) return { duplicate: true, matchId: existing.id, score: titleSim };

    const contentSim = similarity(
      newContent.slice(0, 500),
      existing.content.slice(0, 500)
    );
    if (contentSim > 0.7) return { duplicate: true, matchId: existing.id, score: contentSim };
  }
  return { duplicate: false, score: 0 };
}
