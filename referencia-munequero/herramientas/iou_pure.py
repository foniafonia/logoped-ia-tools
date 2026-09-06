import sys
from PIL import Image

def load(path,bg,tol,H=600):
    im=Image.open(path).convert('RGB'); w,h=im.size; px=im.load()
    xs=[];ys=[]
    mask=[[False]*w for _ in range(h)]
    for y in range(h):
        row=mask[y]
        for x in range(w):
            r,g,b=px[x,y]
            if abs(r-bg[0])>tol or abs(g-bg[1])>tol or abs(b-bg[2])>tol:
                row[x]=True; xs.append(x); ys.append(y)
    x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
    sub=im.crop((x0,y0,x1+1,y1+1))
    mimg=Image.new('L',(x1-x0+1,y1-y0+1))
    mp=mimg.load()
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            mp[x-x0,y-y0]=255 if mask[y][x] else 0
    W=int(round((x1-x0+1)*H/(y1-y0+1)))
    return mimg.resize((W,H),Image.NEAREST).load(), sub.resize((W,H),Image.BILINEAR).load(), W, H

RM,RC,RW,H = load('ref_fig.png',(246,246,246),10)
MM,MC,MW,_ = load(sys.argv[1],(226,226,226),8)
W=max(RW,MW); ro=(W-RW)//2; mo=(W-MW)//2
def at(m,w,off,x,y):
    xx=x-off
    return (0<=xx<w) and m[xx,y]>127
inter=union=0; cerr=0.0; cn=0
zon={'cabeza/gorro':(0,int(H*.34)),'torso/brazos':(int(H*.34),int(H*.66)),'piernas/botas':(int(H*.66),H)}
zst={k:[0,0,0.0,0] for k in zon}
for y in range(H):
    z=[k for k,(a,b) in zon.items() if a<=y<b][0]
    for x in range(W):
        r=at(RM,RW,ro,x,y); m=at(MM,MW,mo,x,y)
        if r or m:
            union+=1; zst[z][1]+=1
            if r and m:
                inter+=1; zst[z][0]+=1
                c1=RC[x-ro,y]; c2=MC[x-mo,y]
                e=(abs(c1[0]-c2[0])+abs(c1[1]-c2[1])+abs(c1[2]-c2[2]))/3
                cerr+=e; cn+=1; zst[z][2]+=e; zst[z][3]+=1
print(f'IoU de silueta     : {inter/union*100:.1f} %')
print(f'Similitud de color : {100*(1-cerr/cn/255):.1f} %')
for k,(i,u,ce,n) in zst.items():
    print(f'  {k:14s} IoU {i/u*100:5.1f} %   color {100*(1-ce/max(n,1)/255):5.1f} %')
