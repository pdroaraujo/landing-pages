# Converte a paleta azul/ciano do template para a da PH (índigo + âmbar).
import colorsys, re, sys, pathlib
def conv(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
    H = h*360
    if not (170 <= H <= 250) or s < 0.08:
        return None
    if l >= 0.88:                       # tintas claras -> lavanda acinzentado
        h2, s2, l2 = 236/360, min(s, 0.45), l
    elif H < 206 and s > 0.45 and l >= 0.45:   # ciano de acento -> âmbar
        h2, s2, l2 = 40/360, 0.95, max(0.5, min(0.78, 0.5 + (l-0.5)*0.75))
    else:                               # azuis/marinhos -> índigo da marca
        h2, s2, l2 = 240/360, min(s, 0.55), l
    r2, g2, b2 = colorsys.hls_to_rgb(h2, l2, s2)
    return round(r2*255), round(g2*255), round(b2*255)
def hexsub(m):
    t = m.group(1); a = ''
    if len(t) in (3, 4): t = ''.join(c*2 for c in t)
    if len(t) == 8: a = t[6:]; t = t[:6]
    c = conv(*(int(t[i:i+2], 16) for i in (0, 2, 4)))
    return m.group(0) if not c else '#%02x%02x%02x%s' % (*c, a)
def rgbsub(m):
    c = conv(int(m.group(2)), int(m.group(3)), int(m.group(4)))
    if not c: return m.group(0)
    return f"{m.group(1)}{c[0]}{m.group(5)}{c[1]}{m.group(6)}{c[2]}"
for p in sys.argv[1:]:
    f = pathlib.Path(p); s = f.read_text(encoding='utf-8')
    s = re.sub(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b', hexsub, s)
    s = re.sub(r'(rgba?\(\s*)(\d+)(\s*,?\s*)(\d+)(\s*,?\s*)(\d+)', lambda m: rgbsub(type('M',(object,),{'group':lambda self,i:[m.group(0),m.group(1),m.group(2),m.group(4),m.group(6),m.group(3),m.group(5)][i]})()), s)
    f.write_text(s, encoding='utf-8'); print('ok', p)
