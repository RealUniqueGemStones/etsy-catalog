async function loadCSV() {
  const res = await fetch('listings.csv');
  const text = await res.text();
  const rows = text.split(/\r?\n/).filter(r=>r.trim()!=="");
  const headers = rows[0].split(',');
  return rows.slice(1).map(r=>{
    const cols = r.split(',');
    let o={};
    headers.forEach((h,i)=>o[h.trim()]=cols[i]?cols[i].trim():"");
    return o;
  });
}

function safeName(t){return t.replace(/[^a-z0-9]/gi,'-');}

async function main(){
  const products = await loadCSV();
  const grid=document.getElementById('catalog');

  // ensure folder link (for local browsers this can't auto-create folders;
  // generated files will download so you can place them in /product-pages/)
  products.forEach(p=>{
    const name=safeName(p.TITLE);
    const card=document.createElement('div');
    card.className='card';
    const img=p.IMAGE1||'';
    card.innerHTML=`<img src="${img}" alt="${p.TITLE}">
                    <div class="info">
                      <div class="title">${p.TITLE}</div>
                      <div class="price">$${p.PRICE}</div>
                    </div>`;
    card.onclick=()=>window.location.href=`product-pages/${name}.html`;
    grid.appendChild(card);

    // generate product page content
    let imgs=[];
    for(let i=1;i<=10;i++){if(p[`IMAGE${i}`]) imgs.push(p[`IMAGE${i}`]);}
    const page=`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${p.TITLE}</title>
<style>
body{font-family:sans-serif;background:#fafafa;margin:0;padding:20px;}
.container{display:flex;gap:40px;flex-wrap:wrap;justify-content:center;}
.left{flex:1;max-width:500px;text-align:center;}
.right{flex:1;max-width:300px;}
img{max-width:100%;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.1);}
button{padding:8px 14px;margin:6px;border:none;background:#333;color:#fff;
       border-radius:6px;cursor:pointer;}
button:hover{background:#555;}
.back{display:inline-block;margin-top:20px;}
</style>
</head>
<body>
<div class="container">
  <div class="left">
    <img id="img" src="${imgs[0]||''}" alt="${p.TITLE}">
    <div>
      <button id="prev">Prev</button>
      <button id="next">Next</button>
    </div>
  </div>
  <div class="right">
    <h2>${p.TITLE}</h2>
    <p><b>Price:</b> ${p.PRICE} ${p.CURRENCY||''}</p>
    <p><b>Quantity:</b> ${p.QUANTITY}</p>
    <a class="back" href="../index.html">← Back to Catalog</a>
  </div>
</div>
<script>
const imgs=${JSON.stringify(imgs)};
let i=0;
document.getElementById('next').onclick=()=>{i=(i+1)%imgs.length;img.src=imgs[i];};
document.getElementById('prev').onclick=()=>{i=(i-1+imgs.length)%imgs.length;img.src=imgs[i];};
</script>
</body>
</html>`;
    const blob=new Blob([page],{type:'text/html'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`${name}.html`;
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}
main();
