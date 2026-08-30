# -*- coding: utf-8 -*-
"""Sella index.html con el hash de app.js y styles.css.
Sin esto, un visitante con la página en caché puede recibir HTML nuevo con código
viejo (o al revés) y la página se rompe. Ejecutar antes de cada publicación."""
import hashlib, io, re, sys

def huella(ruta):
    return hashlib.sha1(io.open(ruta, 'rb').read()).hexdigest()[:8]

html = io.open('index.html', encoding='utf-8').read()
cambios = []
for archivo in ('styles.css', 'app.js'):
    h = huella(archivo)
    patron = re.compile(r'(["\'])' + re.escape(archivo) + r'(?:\?v=[0-9a-f]+)?\1')
    html, n = patron.subn(lambda m: f'{m.group(1)}{archivo}?v={h}{m.group(1)}', html)
    cambios.append(f'{archivo}?v={h}  ({n} referencia)')

io.open('index.html', 'w', encoding='utf-8', newline='\n').write(html)
print('\n'.join(cambios))
