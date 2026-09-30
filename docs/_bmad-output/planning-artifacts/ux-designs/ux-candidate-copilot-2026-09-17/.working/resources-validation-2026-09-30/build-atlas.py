"""Generate design companions only; no product code. Run from any directory."""
import json
from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET

out = Path(__file__).resolve().parent.parent
elements = []
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1980" height="1620" viewBox="0 0 1980 1620" role="img" aria-label="Candidate Copilot — atlas de ressources illustratives">', '<rect width="1980" height="1620" fill="white"/>']
alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

def base(kind,x,y,w,h,fill='transparent',stroke='#444444',group=None):
    i=len(elements)
    e=dict(id=f'resource-20260930-{i:04d}',type=kind,x=x,y=y,width=w,height=h,angle=0,strokeColor=stroke,backgroundColor=fill,fillStyle='solid',strokeWidth=1,strokeStyle='solid',roughness=0,opacity=100,groupIds=[group] if group else [],frameId=None,roundness=None,seed=30000+i,version=1,versionNonce=70000+i,isDeleted=False,boundElements=None,updated=1790726400000,link=None,locked=False,index=chr(97+i//36)+alphabet[i%36])
    elements.append(e)
    return e

def rect(x,y,w,h,fill='#ffffff',group=None):
    e=base('rectangle',x,y,w,h,fill,group=group)
    e['roundness']={'type':3}
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="#444"/>')

def text(x,y,t,size=14,group=None):
    lines=t.split('\n'); w=max(len(line) for line in lines)*size*.57; h=len(lines)*size*1.25
    e=base('text',x,y,w,h,group=group)
    e.update(text=t,originalText=t,fontSize=size,fontFamily=2,textAlign='left',verticalAlign='top',baseline=size*.9,containerId=None,lineHeight=1.25,autoResize=True)
    svg.append(f'<text x="{x}" y="{y+size}" font-size="{size}" fill="#333" font-family="Arial, Helvetica, sans-serif">')
    for i,line in enumerate(lines): svg.append(f'<tspan x="{x}" dy="{0 if i==0 else size*1.25}">{escape(line)}</tspan>')
    svg.append('</text>')

def badge(x,y,label,g):
    base('ellipse',x,y,34,34,'#eeeeee',group=g)
    svg.append(f'<circle cx="{x+17}" cy="{y+17}" r="17" fill="#eee" stroke="#444"/>')
    text(x+7,y+9,label,11,g)

def token(x,y,label,active=False,g=None,width=110):
    rect(x,y,width,36 if active else 26,'#f5f5f5',g)
    text(x+8,y+9 if active else y+6,label,12,g)
    if active: text(x+width-25,y+7,'−',18,g)

def composer(x,y,w,active,g):
    rect(x,y,w,144 if active else 100,group=g)
    if active:
        token(x+10,y+10,'Projet C' if active=='next' else 'Projet A',True,g)
        token(x+126,y+10,'Projet D' if active=='next' else 'Projet B',True,g)
        if w<350: text(x+w-31,y+19,'→',16,g)
        ty=y+58
    else: ty=y+16
    text(x+12,ty,'Brouillon visiteur · inchangé',13,g)
    by=y+(94 if active else 52)
    rect(x+10,by,134,40,'#fafafa',g);text(x+18,by+12,'+ Ressources',12,g)
    rect(x+w-98,by,88,40,'#eeeeee',g);text(x+w-90,by+12,'Envoyer' if active!='next' else 'Désactivé',12,g)

def library(x,y,w,h,selected,g,sheet=False):
    rect(x,y,w,h,group=g)
    text(x+12,y+12,'Ressources',15,g);text(x+w-30,y+12,'×',18,g)
    text(x+12,y+40,'Projets · placeholders',11,g)
    letters=['A','B','C'] if sheet else ['A','B','C','D','E']
    spacing=68 if sheet else 72
    for i,l in enumerate(letters):
        yy=y+68+i*spacing
        text(x+12,yy,'Projet '+l,13,g)
        text(x+12,yy+22,'Dossier public\nDescriptif à renseigner',10,g)
        rect(x+w-53,yy,40,40,'#eeeeee' if l in selected else '#ffffff',g)
        text(x+w-41,yy+10,'✓' if l in selected else '+',16,g)

def desktop(x,y,opened):
    g='desktop-open' if opened else 'desktop-closed'
    text(x,y-34,'B · desktop — ouvert / attente' if opened else 'A · desktop — fermé / aucune sélection',19)
    rect(x,y,900,620,group=g);rect(x,y,900,48,'#fafafa',g)
    text(x+16,y+16,'Conversation · illustration',12,g);text(x+762,y+16,'Confidentialité',12,g)
    cx=x+222;cw=448
    badge(cx,y+68,'BC',g);text(cx+48,y+68,'Nom du candidat',16,g)
    text(cx+48,y+92,'Fonction · placeholder     Lieu · placeholder',12,g)
    rect(cx,y+130,cw,76,'#fafafa',g);text(cx+12,y+142,'▾ Quelques repères',14,g)
    text(cx+12,y+170,'Guide facultatif · texte provisoire, hors transcript.',12,g)
    rect(cx+100,y+236,cw-100,44,group=g);text(cx+112,y+250,'Question illustrative '+('sur A et B' if opened else 'sans sélection'),12,g)
    badge(cx,y+302,'AI',g);rect(cx+46,y+298,cw-46,112,group=g)
    if opened:
        token(cx+58,y+310,'Projet A',g=g);token(cx+174,y+310,'Projet B',g=g)
        text(cx+58,y+355,'•••',22,g)
    else: text(cx+58,y+316,'Réponse neutre · placeholder\nAucun bandeau de périmètre vide.\nAucun fait du candidat.',13,g)
    composer(cx,y+454,cw,'next' if opened else False,g)
    if opened: library(x+704,y+68,180,440,{'C','D'},g)
    text(x+18,y+638,'Historique figé A+B ; actifs C+D pour le prochain tour.' if opened else 'Identité en haut, guide pliable, conversation centrale ; accès en bas à gauche.',13)

text(40,24,'Candidate Copilot · ressources — atlas basse fidélité · 30/09/2026',25)
text(40,65,'Structure approuvée ; contenus illustratifs. Styles, dimensions, noms et copy non finalisés. Aucun upload, aucun fait candidat.',15)
desktop(40,128,False);desktop(1040,128,True)
text(956,390,'+ Ressources\n→',13)

def mobile(x,y,opened):
    g='mobile-open' if opened else 'mobile-closed'
    text(x,y-34,'D · mobile — bibliothèque ouverte' if opened else 'C · mobile — fermé / débordement',18)
    rect(x,y,360,704,group=g);rect(x,y,360,46,'#fafafa',g)
    text(x+12,y+16,'Illustration',11,g);text(x+238,y+16,'Confidentialité',11,g)
    badge(x+16,y+64,'BC',g);text(x+63,y+62,'Nom du candidat',16,g)
    text(x+63,y+87,'Fonction · placeholder\nLieu · placeholder',12,g)
    rect(x+16,y+136,328,80,'#fafafa',g);text(x+28,y+148,'▾ Quelques repères',14,g)
    text(x+28,y+178,'Guide facultatif · formulation provisoire.',11,g)
    rect(x+72,y+240,272,42,group=g);text(x+84,y+253,'Question illustrative sur A, B, C.',12,g)
    badge(x+16,y+302,'AI',g);rect(x+61,y+298,283,200,group=g)
    token(x+73,y+310,'Projet A',g=g);token(x+189,y+310,'Projet B',g=g)
    token(x+73,y+342,'Projet C',g=g)
    text(x+73,y+388,'Réponse neutre · placeholder\nLes jetons historiques se replient\nsur plusieurs lignes, sans retrait.',12,g)
    composer(x+12,y+544,336,True,g)
    if opened: library(x+12,y+252,336,280,{'A','B','C'},g,True)
    text(x+8,y+724,'Feuille superposée, compositeur disponible.' if opened else 'Actifs : rangée unique → défiler, pas de +N.',12)
mobile(40,850,False);mobile(460,850,True)
text(413,1180,'+\n→',18)
rect(890,850,1050,700,'#fafafa')
text(916,874,'Invariants visibles dans le preview HTML interactif',21)
text(916,922,'1 clic = 1 projet + 1 jeton ; multi-sélection immédiate.\nLa bibliothèque reste ouverte : pas de bouton Appliquer, pas d’envoi automatique.\nAucun plafond numérique approuvé ; les cinq dossiers servent uniquement à illustrer.',16)
text(916,1006,'Actifs : rangée horizontale au-dessus du texte, retraits individuels −.\nLe brouillon reste intact ; la sélection persiste après chaque envoi.\nHistorique : instantané dès l’attente, avant le texte de réponse ; conservé en erreur.\nSans sélection : aucune étiquette globale, aucun bandeau historique vide.',16)
text(916,1116,'Portée stricte : preuves publiques des projets sélectionnés seulement.\nSinon : base publique déployée seulement, pas le Web ou des données privées.\nLes jetons de périmètre ne sont pas les citations des passages.',16)
text(916,1200,'Pendant l’attente : brouillon + actifs modifiables pour le PROCHAIN tour.\nLe tour en cours conserve A+B même si le compositeur passe à C+D.\nEnvoi désactivé ; arrivée simulée entière, pas de streaming ou étapes runtime.\nRéponse / erreur ne modifie ni le prochain brouillon ni les actifs ; aucune file.',16)
text(916,1310,'Marge droite libre si elle suffit : aucun reflow ou déplacement du chat.\nSinon : feuille basse superposée, même sur desktop étroit.\nFermeture : position de lecture et focus préservés ; jamais de scroll forcé en lecture haute.\nMobile / desktop de même priorité ; confidentialité accessible en header.',16)
text(916,1420,'Scénarios HTML : zéro, multiple, overflow, attente ≠ sélection actuelle, erreur.\nAperçus : adaptatif, desktop étroit, 390 et 320 px ; largeur réelle, sans mise à l’échelle.\nClavier virtuel, copy finale, contrats runtime et persistance hors validation de ce rendu.',15)
svg.append('</svg>')
file=out/'flow-resources-2026-09-30.excalidraw'
file.write_text(json.dumps(dict(type='excalidraw',version=2,source='https://excalidraw.com',elements=elements,appState=dict(gridSize=None,viewBackgroundColor='#ffffff'),files={}),ensure_ascii=False,indent=2)+'\n')
svgfile=out/'flow-resources-2026-09-30.svg';svgfile.write_text('\n'.join(svg)+'\n')
assert len({e['id'] for e in elements})==len(elements)
assert len({e['index'] for e in elements})==len(elements)
assert all(len(e['index'])==2 for e in elements)
required='id type x y width height angle strokeColor backgroundColor fillStyle strokeWidth strokeStyle roughness opacity groupIds frameId roundness seed version versionNonce isDeleted boundElements updated link locked index'.split()
assert all(all(k in e for k in required) for e in elements)
assert all(e['width']>0 and e['height']>0 for e in elements)
ET.parse(svgfile)
assert len(json.loads(file.read_text())['elements']) == len(elements)
(Path(__file__).resolve().parent/'atlas-results.json').write_text(json.dumps({'elements':len(elements),'checks':['JSON round trip','Unique element IDs','Unique two-character indices','Standard required element fields','Positive dimensions','SVG XML parse'],'limitation':'Editor import not tested; SVG rendered separately in headless Chromium.'},indent=2)+'\n')
print(f'{len(elements)} elements; unique IDs and indices; two-character indices; standard fields; valid JSON and SVG XML.')
