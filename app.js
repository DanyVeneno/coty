'use strict';
const groups=[['1','Maquilas',[]],['2','Estructuras metálicas',[]],['3','Accesorios',[]],['4','Tecnología / electrónica',[]],['5','Artes gráficos',['Corte láser','DTF','Corte CNC','Recorte de vinil','Impresión en vinil']],['6','Herrajes',['Cable acerado']],['7','Material para instalación',[]],['8','Iluminación',['LED blanco','LED COB blanco','Fuente 200','Cable de uso rudo','Cable de bocina','Clavija uso rudo','Solera de aluminio','Perfil rectangular con difusor','Cinta doble cara','Insumos eléctricos']],['9A','Acrílicos / plásticos',['Acrílico Z2 3 mm']],['9B','SPEC',[]],['9C','Maderas / chapas / materiales',['MDF 25 mm','MDF 15 mm','Formaica blanca']],['9D','Pinturas / barniz',['Thinner económico','Vinílica blanca','Resanador','Laca roja','Thinner americano','Barniz de poliuretano','Catalizador','Diluyente']],['9E','Otros insumos',['Pegamento blanco','Pegamento 5000','Insumos menores','Silicón']],['10','Mano de obra',[]],['11','Herramientas / materiales / servicios',[]],['12','Cambios al proyecto',[]],['13','Viáticos de instalación',[]],['14','Muestra',[]],['15','Empaque',['Playo','Polyfoam','Esquineros']],['16','Seguimiento del proyecto',[]],['17','Transporte',[]]].map(([code,name,items])=>({code,name,rows:(items.length?items:['']).map(description=>({description,unit:'',quantity:0,price:0,notes:''}))}));
const $=id=>document.getElementById(id),money=v=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(v),escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=0;
function subtotal(g){return g.rows.reduce((sum,r)=>sum+r.quantity*r.price,0)}
function numeric(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0}
$('category').innerHTML=groups.map((g,i)=>`<option value="${i}">${g.code} · ${escapeHTML(g.name)}</option>`).join('');
function rowHTML(r,i,readonly=false){return `<tr data-row="${i}"><td><input data-key="description" aria-label="Descripción del concepto ${i+1}" value="${escapeHTML(r.description)}" placeholder="Descripción"></td><td><input data-key="unit" aria-label="Unidad del concepto ${i+1}" value="${escapeHTML(r.unit)}" placeholder="pza, m²…"></td><td><input data-key="quantity" aria-label="Cantidad del concepto ${i+1}" type="number" min="0" step="any" value="${r.quantity}"></td><td><input data-key="price" aria-label="Precio unitario del concepto ${i+1}" type="number" min="0" step="0.01" value="${r.price}"></td><td class="amount">${money(r.quantity*r.price)}</td><td><input data-key="notes" aria-label="Observaciones del concepto ${i+1}" value="${escapeHTML(r.notes)}" placeholder="Opcional"></td><td><button class="remove" aria-label="Eliminar concepto ${i+1}" ${readonly?'disabled':''}>×</button></td></tr>`}
function render(){ $('rows').innerHTML=groups[current].rows.map((r,i)=>rowHTML(r,i)).join('');update(); }
function update(){const totals=groups.map(subtotal),total=totals.reduce((a,b)=>a+b,0),pieces=Math.max(1,Math.floor(numeric($('pieces').value)));$('total').textContent=money(total);$('per-piece').textContent=money(total/pieces);$('piece-count').textContent=pieces;$('active').textContent=`${totals.filter(x=>x>0).length} / ${groups.length}`;$('category-total').textContent=money(totals[current]);$('count').textContent=`${groups[current].rows.length} conceptos`;$('overview').innerHTML=groups.map((g,i)=>`<button class="rubric" data-group="${i}"><span><span class="num">${g.code}</span>${escapeHTML(g.name)}</span><strong>${money(totals[i])}</strong></button>`).join('');let ranked=groups.map((g,i)=>({name:g.name,value:totals[i]})).filter(g=>g.value>0).sort((a,b)=>b.value-a.value);$('distribution').innerHTML=ranked.length?ranked.map(g=>`<div class="bar-item"><div class="bar-label"><span>${escapeHTML(g.name)}</span><strong>${(g.value/total*100).toFixed(1)}%</strong></div><div class="bar-track"><div class="bar-fill" style="width:${g.value/total*100}%"></div></div></div>`).join(''):'<p class="muted">Captura precios para ver qué rubros concentran el presupuesto.</p>';}
$('category').addEventListener('change',e=>{current=Number(e.target.value);render()});
$('rows').addEventListener('input',e=>{const key=e.target.dataset.key;if(!key)return;const i=Number(e.target.closest('tr').dataset.row),row=groups[current].rows[i];row[key]=['quantity','price'].includes(key)?numeric(e.target.value):e.target.value;e.target.closest('tr').querySelector('.amount').textContent=money(row.quantity*row.price);update()});
$('rows').addEventListener('change',e=>{if(['quantity','price'].includes(e.target.dataset.key))e.target.value=numeric(e.target.value)});
$('rows').addEventListener('click',e=>{const btn=e.target.closest('.remove');if(!btn)return;groups[current].rows.splice(Number(btn.closest('tr').dataset.row),1);render()});
$('add').addEventListener('click',()=>{groups[current].rows.push({description:'',unit:'',quantity:0,price:0,notes:''});render();$('rows').lastElementChild.querySelector('input').focus()});
$('pieces').addEventListener('input',update);$('pieces').addEventListener('change',()=>{$('pieces').value=Math.max(1,Math.floor(numeric($('pieces').value)));update()});
$('overview').addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(!b)return;current=Number(b.dataset.group);$('category').value=current;render();});
// Keep category navigation in the working surface.
$('overview').addEventListener('click',e=>{if(e.target.closest('[data-group]')){document.querySelector('.costs').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});$('category').focus({preventScroll:true})}});
for(const id of ['start','end'])$(id).addEventListener('change',()=>{$('date-error').textContent=$('start').value&&$('end').value&&$('end').value<$('start').value?'La fecha de entrega debe ser igual o posterior a la fecha de inicio.':''});
let originalRows='';
window.addEventListener('beforeprint',()=>{originalRows=$('rows').innerHTML;$('rows').innerHTML=groups.map(g=>{const rows=g.rows.filter(r=>r.description||r.quantity||r.price||r.notes);return rows.length?`<tr><td colspan="7"><h3 class="print-category">${escapeHTML(g.code+' · '+g.name)} — ${money(subtotal(g))}</h3></td></tr>${rows.map((r,i)=>rowHTML(r,i,true)).join('')}`:''}).join('')});
window.addEventListener('afterprint',()=>render());$('print').addEventListener('click',()=>window.print());
render();

function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  const dark=theme==='dark';
  $('theme-toggle').textContent=dark?'Modo claro':'Modo oscuro';
  $('theme-toggle').setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');
  $('theme-toggle').setAttribute('aria-pressed',String(dark));
}
applyTheme(document.documentElement.dataset.theme||'light');
$('theme-toggle').addEventListener('click',()=>{
  const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  applyTheme(theme);
  try{localStorage.setItem('cotizacion-theme',theme)}catch{}
});
