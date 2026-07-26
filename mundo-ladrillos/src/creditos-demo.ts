import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { mountCredits } from './ui/Credits';
document.body.style.margin='0'; document.body.style.height='100vh';
document.body.style.background=`#1c130a url("${bgJericoMurallas}") center/cover no-repeat`;
mountCredits(document.body, {});
(window as any).__ready = true;
