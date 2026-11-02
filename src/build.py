#!/usr/bin/env python3
"""Builds the single-file ../index.html from index.template.html + css/ + js/.
Usage:  python3 build.py
Each <!--@css:FILE| attrs--> / <!--@js:FILE| attrs--> marker in the template is replaced by an inline <style>/<script>.
File order in the template = cascade/execution order, so keep it."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, 'index.template.html'), encoding='utf-8').read()
def rep(m):
    ext, fn, attrs = m.group(1), m.group(2), m.group(3)
    body = open(os.path.join(here, ext, fn), encoding='utf-8').read()
    if ext == 'js': body = body.replace('</script', '<\\/script')
    tag = 'style' if ext == 'css' else 'script'
    return '<%s%s>%s</%s>' % (tag, attrs, body, tag)
out = re.sub(r'<!--@(css|js):([^|]+)\|([^>]*?)-->', rep, t)
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf-8').write(out)
print('built index.html', len(out), 'bytes')
