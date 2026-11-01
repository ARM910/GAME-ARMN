# يبني index.html كملف واحد جاهز: python3 build.py  ->  ../index.html
import re,os
here=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(here,'index.src.html'),encoding='utf-8').read()
css=lambda m:'<style%s>\n%s\n</style>'%(m.group(2) or '',open(os.path.join(here,m.group(1)),encoding='utf-8').read())
js=lambda m:'<script%s>\n%s\n</script>'%(m.group(2) or '',open(os.path.join(here,m.group(1)),encoding='utf-8').read().replace('</script','<\\/script'))
s=re.sub(r'<link rel="stylesheet" href="(css/[^"]+)"( id="[^"]+")?>',css,s)
s=re.sub(r'<script src="(js/[^"]+)"( id="[^"]+")?></script>',js,s)
open(os.path.join(here,'..','index.html'),'w',encoding='utf-8').write(s)
print('built',len(s))
