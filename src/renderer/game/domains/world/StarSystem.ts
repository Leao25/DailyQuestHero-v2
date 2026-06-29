// Stars are rendered as DOM elements (CSS animation) — this module creates and manages them.
export function initStars(count = 120): () => void {
  const stars: HTMLDivElement[] = []

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'star'
    const size = 1 + Math.random() * 2
    el.style.cssText = [
      `left: ${Math.random() * 100}vw`,
      `top: ${Math.random() * 85}vh`,
      `width: ${size}px`,
      `height: ${size}px`,
      `--dur: ${2 + Math.random() * 4}s`,
      `--delay: ${-Math.random() * 5}s`,
      `--peak: ${0.4 + Math.random() * 0.6}`,
    ].join(';')
    document.body.appendChild(el)
    stars.push(el)
  }

  return () => stars.forEach((s) => s.remove())
}
