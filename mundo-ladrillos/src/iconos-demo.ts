import { iconShofar, iconCoin } from './assets/gameIcons';

/**
 * Demo showcase de los iconos de juego (Higgsfield, WebP transparente): shofar,
 * shékel y corazón, montados como chips de HUD sobre un panel oscuro para
 * comprobar que la transparencia recorta limpio. Listos para Hud/Collectibles.
 */
const root = document.createElement('div');
root.style.cssText = `position:fixed;inset:0;display:flex;flex-direction:column;gap:28px;
  align-items:center;justify-content:center;background:linear-gradient(160deg,#2a1c10,#12212e);
  font-family:'Trebuchet MS',system-ui,sans-serif`;

const row = document.createElement('div');
row.style.cssText = 'display:flex;gap:34px;align-items:center';
const items: [string, string, string][] = [
  [iconShofar, 'Shofar', '×3'],
  [iconCoin, 'Shékel', '128']
];
for (const [src, label, val] of items) {
  const chip = document.createElement('div');
  chip.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:8px;
    background:rgba(20,14,6,.55);border:2px solid rgba(255,220,160,.25);border-radius:16px;
    padding:16px 22px;box-shadow:0 8px 20px rgba(0,0,0,.4)`;
  const img = document.createElement('img');
  img.src = src; img.width = 84; img.height = 84;
  img.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,.5))';
  const cap = document.createElement('div');
  cap.style.cssText = 'color:#ffe7bd;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:.85rem';
  cap.textContent = `${label}  ${val}`;
  chip.append(img, cap);
  row.appendChild(chip);
}

const title = document.createElement('div');
title.style.cssText = 'color:#f4dcb4;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:1.1rem;opacity:.9';
title.textContent = 'Iconos de juego · ladrillo';

root.append(title, row);
document.body.appendChild(root);
(window as any).__ready = true;
