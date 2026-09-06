import pymupdf, sys
path=sys.argv[1]; bg=tuple(int(v) for v in sys.argv[2].split(',')); tol=int(sys.argv[3])
pix=pymupdf.Pixmap(path)
if pix.n>3: pix=pymupdf.Pixmap(pymupdf.csRGB,pix)
W,H,s,n=pix.width,pix.height,pix.samples,pix.n
def runs_at(y):
    xs=[];base=n*y*W
    for x in range(W):
        i=base+n*x
        if abs(s[i]-bg[0])>tol or abs(s[i+1]-bg[1])>tol or abs(s[i+2]-bg[2])>tol: xs.append(x)
    if not xs: return []
    out=[];a=xs[0];p=xs[0]
    for v in xs[1:]:
        if v-p>2: out.append((a,p)); a=v
        p=v
    out.append((a,p)); return [r for r in out if r[1]-r[0]>=3]
# bbox
ys=[y for y in range(H) if runs_at(y)]
y0,y1=min(ys),max(ys)
allr=[runs_at(y) for y in range(y0,y1+1)]
x0=min(r[0][0] for r in allr if r); x1=max(r[-1][1] for r in allr if r)
Hf=y1-y0+1; Wf=x1-x0+1
print(f'bbox {Wf}x{Hf}  ratio {Wf/Hf:.3f}  y0={y0} y1={y1} x0={x0} x1={x1}')
for pct in [34,38,42,46,50,54,58,60,62,64,66,68,70,74,78,82,86,90,94,98]:
    y=y0+int(Hf*pct/100)
    rr=runs_at(y)
    tot=sum(b-a+1 for a,b in rr)
    span=(rr[-1][1]-rr[0][0]+1) if rr else 0
    print(f'{pct:3d}% y={y:4d} span={span/Wf:.3f} solid={tot/Wf:.3f} runs=' + ' '.join(f'[{(a-x0)/Wf:.3f}..{(b-x0)/Wf:.3f}]' for a,b in rr))
