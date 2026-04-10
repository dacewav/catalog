// ═══ DACEWAV Admin — Config & Constants ═══
export { FC, DACE_VER, ANIMS } from '../config.js';

export const EMOJIS = ['🔥','💎','🎵','🎶','💿','🎧','🎤','🎹','🥁','🎸','🎷','⚡','⭐','🌟','💫','👑','🏆','💰','💵','🎯','🚀','💀','🖤','❤️','💜','💙','💚','✅','❌','🔔','📢','🎁','❄️','🌊','🌙','☀️','🌈','👾','🤖','🔊'];

export const FONT_DISPLAY = [
  ['Syne','Syne'],['Oswald','Oswald'],['Rajdhani','Rajdhani'],['Exo 2','Exo 2'],['Barlow Condensed','Barlow Condensed'],
  ['Raleway','Raleway'],['Montserrat','Montserrat'],['Poppins','Poppins'],['Josefin Sans','Josefin Sans'],
  ['Sora','Sora'],['Space Grotesk','Space Grotesk'],['Outfit','Outfit'],['Plus Jakarta Sans','Plus Jakarta Sans'],
  ['Figtree','Figtree'],['Red Hat Display','Red Hat Display'],['Lexend','Lexend'],['Manrope','Manrope'],
  ['Nunito Sans','Nunito Sans'],['Work Sans','Work Sans'],['Rubik','Rubik'],['DM Sans','DM Sans'],['Urbanist','Urbanist'],
  ['Bebas Neue','Bebas Neue'],['Anton','Anton'],['Archivo Black','Archivo Black'],['Unbounded','Unbounded'],
  ['Righteous','Righteous'],['Comfortaa','Comfortaa'],['Major Mono Display','Major Mono Display'],
  ['Bangers','Bangers'],['Permanent Marker','Permanent Marker'],['Black Ops One','Black Ops One'],
  ['Bungee','Bungee'],['Passion One','Passion One'],['Alfa Slab One','Alfa Slab One'],
  ['Teko','Teko'],['Staatliches','Staatliches'],['Pathway Extreme','Pathway Extreme'],
  ['Playfair Display','Playfair Display'],['Cinzel','Cinzel'],['Cormorant Garamond','Cormorant Garamond'],
  ['DM Serif Display','DM Serif Display'],['Libre Baskerville','Libre Baskerville'],
  ['Fraunces','Fraunces'],['Bricolage Grotesque','Bricolage Grotesque'],
  ['Press Start 2P','Press Start 2P'],['Space Mono','Space Mono'],['IBM Plex Mono','IBM Plex Mono']
];

export const FONT_BODY = [
  ['DM Mono','DM Mono'],['IBM Plex Mono','IBM Plex Mono'],['Space Mono','Space Mono'],
  ['Share Tech Mono','Share Tech Mono'],['Fira Code','Fira Code'],['JetBrains Mono','JetBrains Mono'],
  ['Ubuntu Mono','Ubuntu Mono'],['Courier Prime','Courier Prime'],['Inconsolata','Inconsolata'],
  ['Source Code Pro','Source Code Pro'],['Anonymous Pro','Anonymous Pro'],['Roboto Mono','Roboto Mono'],
  ['Inter','Inter'],['Manrope','Manrope'],['Nunito','Nunito'],['Quicksand','Quicksand'],
  ['Poppins','Poppins'],['Montserrat','Montserrat'],['Raleway','Raleway'],['Sora','Sora'],
  ['DM Sans','DM Sans'],['Work Sans','Work Sans'],['Figtree','Figtree'],['Plus Jakarta Sans','Plus Jakarta Sans'],
  ['Outfit','Outfit'],['Lexend','Lexend'],['Nunito Sans','Nunito Sans'],['Rubik','Rubik'],
  ['Urbanist','Urbanist'],['Karla','Karla'],['Source Sans 3','Source Sans 3'],['Cabin','Cabin'],
  ['Lora','Lora'],['Crimson Text','Crimson Text'],['Merriweather','Merriweather'],
  ['PT Serif','PT Serif'],['Libre Baskerville','Libre Baskerville'],['EB Garamond','EB Garamond'],
  ['Playfair Display','Playfair Display'],['Cormorant Garamond','Cormorant Garamond'],['Fraunces','Fraunces']
];

export const COLOR_DEFS = [
  {id:'tc-bg',prop:'bg',label:'Fondo',def:'#060404'},
  {id:'tc-surface',prop:'surface',label:'Surface',def:'#0f0808'},
  {id:'tc-surface2',prop:'surface2',label:'Surface 2',def:'#1a0c0c'},
  {id:'tc-text',prop:'text',label:'Texto',def:'#f5eeee'},
  {id:'tc-muted',prop:'muted',label:'Muted',def:'rgba(245,238,238,0.5)',alpha:true},
  {id:'tc-hint',prop:'hint',label:'Hint',def:'rgba(245,238,238,0.2)',alpha:true},
  {id:'tc-border',prop:'border',label:'Borde',def:'rgba(255,255,255,0.06)',alpha:true},
  {id:'tc-border2',prop:'border2',label:'Borde 2',def:'rgba(255,255,255,0.12)',alpha:true},
  {id:'tc-accent',prop:'accent',label:'Acento',def:'#dc2626'},
  {id:'tc-red',prop:'red',label:'Red base',def:'#7f1d1d'},
  {id:'tc-red-l',prop:'redL',label:'Red light',def:'#991b1b'},
  {id:'tc-glow-c',prop:'glowColor',label:'Glow',def:'#dc2626'},
  {id:'tc-wbar-c',prop:'wbarColor',label:'Wave bar',def:'rgba(255,255,255,0.18)',alpha:true},
  {id:'tc-wbar-a',prop:'wbarActive',label:'Wave activo',def:'#dc2626'},
  {id:'tc-btn-c',prop:'btnLicClr',label:'Btn texto',def:'#dc2626'},
  {id:'tc-btn-b',prop:'btnLicBdr',label:'Btn borde',def:'rgba(185,28,28,0.5)',alpha:true},
  {id:'tc-btn-bg',prop:'btnLicBg',label:'Btn fondo',def:'rgba(185,28,28,0.1)',alpha:true},
  {id:'tc-shadow',prop:'cardShadowColor',label:'Sombra',def:'#000000'},
  {id:'tc-banner',prop:'bannerBg',label:'Banner',def:'#7f1d1d'},
  {id:'tc-particles',prop:'particlesColor',label:'Partículas',def:'#dc2626'}
];
