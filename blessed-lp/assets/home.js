(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  document.documentElement.classList.add('js');

  // menu
  const btn=document.getElementById('menuBtn');
  const toggle=o=>{document.body.classList.toggle('menu-open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Fechar menu':'Abrir menu')};
  btn.addEventListener('click',()=>toggle(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('#overlay a').forEach(a=>a.addEventListener('click',()=>toggle(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});

  // CARDÁPIO: os itens já vêm no HTML (gerados por _build/gerar.mjs); aqui só filtra
  const fWrap=document.getElementById('filters'),list=document.getElementById('menuList'),more=document.getElementById('moreBtn'),cnt=document.getElementById('moreCount');
  const items=[...list.children];
  function apply(f,anim){
    let n=0;
    items.forEach(el=>{const on=f==='all'?el.hasAttribute('data-all'):(el.dataset.c===f&&el.hasAttribute('data-top'));el.hidden=!on;if(on)n++});
    list.classList.toggle('filtered',f!=='all');
    const total=fWrap.querySelector(`[data-f="${f}"]`).dataset.n;
    more.href='/cardapio'+(f==='all'?'':'#'+f);cnt.textContent=`Mostrando ${n} de ${total} itens`;
    if(!reduce&&anim)items.filter(el=>!el.hidden).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:500,delay:i*35,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
  }
  fWrap.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;fWrap.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));apply(b.dataset.f,true)});
  apply('all');

  // FAQ
  const tabs=[...document.querySelectorAll('#faqTabs button')],qas=[...document.querySelectorAll('#faqList .qa')];
  tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.setAttribute('aria-pressed',x===t));const f=t.dataset.f;qas.forEach(q=>{q.hidden=!(f==='all'||q.dataset.c===f)})}));

  // revelar palavras + fade
  document.querySelectorAll('.reveal-words').forEach(el=>{let i=0;
    const walk=n=>{[...n.childNodes].forEach(c=>{
      if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.append(p)}else{const s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=p;f.append(s)}});c.replaceWith(f)}
      else if(c.nodeType===1)walk(c)})};walk(el)});
  const targets=[...document.querySelectorAll('.reveal-words,.fade')];
  if(!reduce&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
    targets.forEach(t=>{if(t.getBoundingClientRect().top>innerHeight){t.classList.add('pending');io.observe(t)}});
  }

  // parallax do hero
  const frames=[...document.querySelectorAll('#stage .frame')];
  if(!reduce){let tk=false;addEventListener('scroll',()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{const y=scrollY;frames.forEach(f=>{f.style.translate=`0 ${-y*parseFloat(f.dataset.depth)}px`});tk=false})},{passive:true})}

  // trilha de imagens no cursor (no celular: toque na área)
  const mood=document.getElementById('mood');
  const pics=['matcha_laptop','ig_paper_cup','red_drink','ig_staff_croissant','latte_glass','cheesecake','watermelon_matcha','ig_team','cookies','espresso'].map(k=>`assets/img/${k}.webp`);
  if(touch)document.getElementById('moodHint').textContent='Toque aqui!';
  [[11,24,-8],[89,22,7],[12,80,5],[88,82,-6]].forEach(([x,y,r],k)=>{const d=document.createElement('div');d.className='trail rest';d.style.left=x+'%';d.style.top=y+'%';d.style.setProperty('--r',r+'deg');d.innerHTML=`<img src="${pics[k*2+1]}" alt="" loading="lazy" decoding="async">`;mood.append(d)});
  // pré-carrega as fotos da trilha só quando a seção chega perto da tela
  if('IntersectionObserver' in window){const pio=new IntersectionObserver(es=>{if(es[0].isIntersecting){pics.forEach(s=>{new Image().src=s});pio.disconnect()}},{rootMargin:'300px'});pio.observe(mood)}
  let idx=0,last={x:-999,y:-999};
  const spawn=(x,y)=>{
    mood.querySelectorAll('.trail.rest').forEach(r=>{r.classList.remove('rest');r.classList.add('off');setTimeout(()=>r.remove(),600)});
    const d=document.createElement('div');d.className='trail';d.style.left=x+'px';d.style.top=y+'px';
    d.style.setProperty('--r',(Math.random()*16-8).toFixed(1)+'deg');d.innerHTML=`<img src="${pics[idx++%pics.length]}" alt="">`;
    mood.append(d);requestAnimationFrame(()=>d.classList.add('on'));
    setTimeout(()=>d.classList.add('off'),900);setTimeout(()=>d.remove(),1500)};
  const pos=e=>{const b=mood.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
  if(!reduce){
    mood.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const[x,y]=pos(e);if(Math.hypot(x-last.x,y-last.y)>110){last={x,y};spawn(x,y)}});
    mood.addEventListener('click',e=>{if(e.target.closest('a'))return;const[x,y]=pos(e);spawn(x,y)});
  }

  // copiar telefone
  const cb=document.getElementById('copyBtn'),ph=document.getElementById('phone');
  cb.addEventListener('click',()=>{const t=ph.textContent;
    const ok=()=>{cb.textContent='Copiado';setTimeout(()=>cb.textContent='Copiar',1800)};
    const fb=()=>{const r=document.createRange();r.selectNodeContents(ph);const s=getSelection();s.removeAllRanges();s.addRange(r)};
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(ok,fb)}else fb()});
})();
