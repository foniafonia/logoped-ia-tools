import pymupdf, sys
def prof(path,bg,tol,nb=20):
    pix=pymupdf.Pixmap(path)
    if pix.n>3: pix=pymupdf.Pixmap(pymupdf.csRGB,pix)
    W,H,s,n=pix.width,pix.height,pix.samples,pix.n
    rows=[]
    for y in range(H):
        xs=[];base=n*y*W
        for x in range(W):
            i=base+n*x
            if abs(s[i]-bg[0])>tol or abs(s[i+1]-bg[1])>tol or abs(s[i+2]-bg[2])>tol: xs.append(x)
        if len(xs)<6: rows.append(None); continue
        rows.append((xs[0],xs[-1]))          # SPAN total (incluye manos)
    ys=[y for y,v in enumerate(rows) if v]
    y0,y1=min(ys),max(ys); hgt=y1-y0+1
    out=[]
    for k in range(nb):
        a=y0+int(hgt*k/nb); b=y0+int(hgt*(k+1)/nb)
        ws=[v[1]-v[0]+1 for v in rows[a:b] if v]
        out.append((sum(ws)/len(ws))/hgt if ws else 0)
    return out,hgt
ref,_=prof('ref_fig.png',(246,246,246),10)
mine,_=prof(sys.argv[1],(226,226,226),8)
z=['gorro top','gorro','cabeza','cabeza','cara','cara','barba','hombros','torso alto','torso','torso bajo','brazos/manos','cintura','cadera','muslo','muslo','rodilla','pierna','pierna','pies']
print('ANCHO DE CADA BANDA EN UNIDADES DE ALTURA TOTAL (sin normalizar por el ancho máximo)\n')
print('banda | zona         |  ref  |  mía  |  dif   | %')
tot=0
for i,(a,b) in enumerate(zip(ref,mine)):
    d=b-a; tot+=abs(d); f='  <<<' if abs(d)>0.04 else ''
    print(f'  {i:2d}  | {z[i]:12s} | {a:.3f} | {b:.3f} | {d:+.3f} | {d/a*100:+5.1f}%{f}')
print(f'\nerror medio absoluto: {tot/20:.4f}  (0 = idéntico)')
