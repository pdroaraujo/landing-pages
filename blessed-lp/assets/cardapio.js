(function(){
  // as seções já vêm no HTML (geradas por _build/gerar.mjs); aqui só marca a aba ativa conforme a rolagem
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs=document.getElementById('tabs'),secs=[...document.querySelectorAll('.cat-sec')];
  const links=[...tabs.querySelectorAll('a')];
  const setActive=(k,scroll)=>links.forEach(a=>{const on=a.dataset.k===k;a.setAttribute('aria-current',on);
    if(on&&scroll)tabs.scrollTo({left:a.offsetLeft-(tabs.clientWidth-a.offsetWidth)/2,behavior:reduce?'auto':'smooth'})});
  let cur='';
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.target.id!==cur){cur=e.target.id;setActive(cur,true)}})},{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(s=>io.observe(s));
  const h=location.hash.slice(1);
  setActive(secs.some(s=>s.id===h)?h:secs[0].id,false);
})();
