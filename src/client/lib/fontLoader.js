// src/client/lib/fontLoader.js

// TODO: wtf is this font fuckery

function ensureFontLink({ id, href }) {
  if (!document.getElementById(id)) {
    const link      = document.createElement('link');
          link.id   = id;
          link.rel  = 'stylesheet';
          link.href = href;
    document.head.appendChild(link);
  }
}

const gurl = f => `https://fonts.googleapis.com/css2?family=${f}:wght@400;700&display=swap`
export const FontPicks = {
  avenir: { 
    label: 'Avenir Next (Apple)', 
    value: 'avenir',
    cls: 'font-avenir'
  },
  nunito: {
      id: 'nunito-font',
      href: gurl('Nunito'),
      cls: 'font-nunito',
      label: 'Nunito (Google)',
      value: 'nunito'
    },
  lato: {
      id: 'lato-font',
      href: gurl('Lato'),
      cls: 'font-lato',
      label: 'Lato (Google)',
      value: 'lato'
    },
  noto: {
      id: 'noto-font',
      href: gurl('Noto+Sans'),
      cls: 'font-noto',
      label: 'Noto Sans (Google)',
      value: 'noto'
    }
}

/**
 * Loads the Nunito font from Google Fonts if needed and sets the font class on <html>.
 * @param {string} font - 'nunito' or 'avenir'
 */
export function setFontClass(font) {
  FontPicks[font] && ensureFontLink(FontPicks[font]);
  const html = document.documentElement;
  html.classList.remove('font-nunito', 'font-avenir', 'font-lato', 'font-noto');
  if( FontPicks[font] ) {
    html.classList.add(FontPicks[font].cls);
  } else {
    html.classList.add('font-avenir');
  }
}

/**
 * Loads the font preference from localStorage and applies it.
 * Defaults to 'avenir' on Apple devices, otherwise 'noto'.
 */
export function applyInitialFont(defaultFont = 'noto') {
  try {
    const isApple = /Mac|iPhone|iPad|iPod/.test(String(navigator.platform)) || /Mac|iPhone|iPad|iPod/.test(String(navigator.userAgent));
    if (isApple) 
      defaultFont = 'avenir';
    const font = localStorage.getItem('fontPref') || defaultFont;
    setFontClass(font);
  } catch (e) {}
}


