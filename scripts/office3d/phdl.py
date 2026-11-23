import json, os, sys, urllib.request
o = urllib.request.build_opener(); o.addheaders = [('User-Agent', 'curl/8.5.0')]; urllib.request.install_opener(o)
names = sys.argv[1:]
for n in names:
    d = json.load(urllib.request.urlopen('https://api.polyhaven.com/files/' + n))
    g = d['gltf']['1k']['gltf']
    out = os.path.join('ph', n); os.makedirs(out, exist_ok=True)
    urllib.request.urlretrieve(g['url'], os.path.join(out, n + '.gltf'))
    for rel, f in g['include'].items():
        p = os.path.join(out, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        urllib.request.urlretrieve(f['url'], p)
    print(n, 'ok', sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs) // 1024, 'KB')
