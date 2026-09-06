import sys
from PIL import Image
def scan(path,bg,tol,tag):
    im=Image.open(path).convert('RGB'); px=im.load(); W,H=im.size
    xs=[];ys=[]
    for y in range(0,H,2):
        for x in range(0,W,2):
            r,g,b=px[x,y]
            if abs(r-bg[0])>tol or abs(g-bg[1])>tol or abs(b-bg[2])>tol: xs.append(x);ys.append(y)
    x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys); Hf=y1-y0+1
    def cls(c):
        r,g,b=c
        if abs(r-bg[0])<=tol and abs(g-bg[1])<=tol and abs(b-bg[2])<=tol: return '.'
        if r>185 and g>135 and b<115: return 'Y'
        if b>r+22: return 'B'
        return 'P'      # pelo o barba
    print(tag)
    for pct in [19,21,23,25,27,29]:
        y=y0+int(Hf*pct/100)
        row=[cls(px[x,y]) for x in range(x0,x1+1)]
        # borde de cabeza = primer/ultimo no fondo
        idx=[i for i,c in enumerate(row) if c!='.']
        if not idx: continue
        a,b_=idx[0],idx[-1]; half=(b_-a+1)/2
        # ancho de pelo a la izquierda: hasta el primer amarillo
        try: yl=row.index('Y')
        except ValueError: yl=None
        yr=None
        for i in range(len(row)-1,-1,-1):
            if row[i]=='Y': yr=i; break
        if yl is None: print(f'  {pct}%  sin amarillo (cara tapada)'); continue
        izq=(yl-a)/half*100; der=(b_-yr)/half*100
        print(f'  {pct}%  pelo izq {izq:4.0f} %  ·  pelo der {der:4.0f} %   (de media cara)')
scan('ref_fig.png',(246,246,246),10,'REFERENCIA')
scan(sys.argv[1],(224,224,224),9,'NUESTRO '+sys.argv[1])
