/**
 * Applies the theme before first paint to avoid a flash.
 * Reads the server-rendered `data-theme-default` attribute when the user
 * has not chosen a theme yet.
 */
export function ThemeScript() {
  const code = `(function(){try{
var e=document.documentElement;
var saved=localStorage.getItem('nav-theme');
var mode=saved||e.getAttribute('data-theme-default')||'system';
var dark=mode==='dark'||(mode==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
e.classList.toggle('dark',dark);
if(e.getAttribute('data-theme-color')){var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',e.getAttribute('data-theme-color'));}
}catch(_){}})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
