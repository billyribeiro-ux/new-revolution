// An SVG used as <img> cannot fetch the page stylesheet. Embed the existing licensed
// face here; this image-context asset exception does not add a CSS package import.
import sofiaFace from '@fontsource-variable/sofia-sans/files/sofia-sans-latin-wght-normal.woff2?inline';

export const svgBrandFontStyle = `<style>@font-face{font-family:'Sofia Sans Variable';src:url('${sofiaFace}') format('woff2');font-style:normal;font-weight:1 1000;}text{font-family:'Sofia Sans Variable',sans-serif;}</style>`;
