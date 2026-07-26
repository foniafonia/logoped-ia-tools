import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountSettings } from './ui/SettingsPanel';
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;
mountSettings(document.body, {
  values: { music: 70, sfx: 90, quality: 'alto' },
  onChange: (v) => console.log('ajustes', v),
  onClose: () => {}
});
(window as any).__ready = true;
