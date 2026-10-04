// Inline script (runs before first paint) that decides whether motion is allowed and records it on <html>.
// Result: html[data-motion='on'|'off']. Without JS the attribute is absent and every component renders its static state.
export const MOTION_STORAGE_KEY = 'sn-motion'

export const motionInitScript = `(function(){try{var d=document.documentElement;var s=null;try{s=localStorage.getItem('${MOTION_STORAGE_KEY}')}catch(e){}var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-motion',(s==='off'||(r&&s!=='on'))?'off':'on');var t=null;try{t=localStorage.getItem('sn-theme')}catch(e){}if(t==='light'&&location.pathname.indexOf('/lab')===0){d.setAttribute('data-theme','light')}}catch(e){}})();`
