import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountHealth } from './ui/Health';
import { mountCompass } from './ui/Compass';
import { toast } from './ui/Toast';

document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.background = `#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;

const comp = mountCompass(document.body, { label: 'Muralla' });
comp.set(0.6, 42);                 // apunta arriba-derecha, 42 m

const hp = mountHealth(document.body, { max: 3 });
(hp.root as HTMLElement).style.top = '62px';   // debajo de la brújula (demo)

// gira la flecha lentamente y simula un golpe
let a = 0.6;
setInterval(() => { a += 0.03; comp.set(a, Math.max(2, 42 - a * 3)); }, 120);
setTimeout(() => { hp.damage(); toast('¡Cuidado!', { icon: '⚔️', variant: 'accent' }); }, 900);

(window as any).__ready = true;
