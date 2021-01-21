import i18n from 'src/i18n'

export const fetchI18nContent = (content: { [lang: string]: any }) => {
  const language = i18n.language.toLowerCase()
  const texts = content[language] || content[language.slice(0, 2)] || 'en'
  for (const key of Object.keys(texts)) {
    // This is needed for newlines to show properly.
    texts[key] = texts[key].replace(/\\n/g, '\n')
  }
  return texts
}
