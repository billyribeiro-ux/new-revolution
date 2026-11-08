// An SVG used as <img> cannot fetch the page stylesheet. Embed the existing licensed
// face here; this image-context asset exception does not add a CSS package import.
import geistFace from '#lib/assets/fonts/geist-sans/static/geist-sans-latin-400-normal.woff2?inline';

export const svgBrandFontStyle = `<style>@font-face{font-family:'Geist Sans';src:url('${geistFace}') format('woff2');font-style:normal;font-weight:400;}text{font-family:'Geist Sans',sans-serif;}</style>`;
