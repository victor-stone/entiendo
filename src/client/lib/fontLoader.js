// src/client/lib/fontLoader.js

/**
 * Loads the Nunito font from Google Fonts if needed and sets the font class on <html>.
 * @param {string} font - 'nunito' or 'avenir'
 */
export function setFontClass(font) {
  if (font === 'nunito' && !document.getElementById('nunito-font')) {
    const link = document.createElement('link');
    link.id = 'nunito-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap';
    document.head.appendChild(link);
  }
  if (font === 'lato' && !document.getElementById('lato-font')) {
    const link = document.createElement('link');
    link.id = 'lato-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap';
    document.head.appendChild(link);
  }
  if (font === 'noto' && !document.getElementById('noto-font')) {
    const link = document.createElement('link');
    link.id = 'noto-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap';
    document.head.appendChild(link);
  }
  const html = document.documentElement;
  html.classList.remove('font-nunito', 'font-avenir', 'font-lato', 'font-noto');
  if (font === 'nunito') {
    html.classList.add('font-nunito');
  } else if (font === 'lato') {
    html.classList.add('font-lato');
  } else if (font === 'noto') {
    html.classList.add('font-noto');
  } else {
    html.classList.add('font-avenir');
  }
}

/**
 * Loads the font preference from localStorage and applies it.
 * Defaults to 'noto' if not set.
 */
export function applyInitialFont(defaultFont = 'noto') {
  try {
    const font = localStorage.getItem('fontPref') || defaultFont;
    setFontClass(font);
  } catch (e) {}
}
