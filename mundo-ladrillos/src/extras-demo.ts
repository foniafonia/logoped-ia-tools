import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountLoading } from './ui/LoadingScreen';
import { mountCounter } from './ui/Collectibles';
import { toast } from './ui/Toast';

document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;

const load = mountLoading(document.body, {});
let p = 0;
const t = setInterval(() => {
  p += 0.09; load.setProgress(p);
  if (p >= 1) {
    clearInterval(t);
    setTimeout(() => {
      load.done();
      const relics = mountCounter(document.body, { icon: '🏺', total: 7, value: 2, place: 'top-right' });
      (window as any).__relics = relics;
      setTimeout(() => { relics.inc(); toast('¡Reliquia conseguida!', { icon: '🏺', variant: 'primary' }); }, 500);
      setTimeout(() => toast('Tramo desbloqueado', { icon: '🔓', variant: 'accent' }), 1100);
    }, 350);
  }
}, 130);

(window as any).__ready = true;
