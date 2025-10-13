async function loadCSV() {
  const res = await fetch('listings.csv');
  const text = await res.text();
  const rows = text.split(/\r?\n/).filter(r => r.trim() !== "");
  const headers = rows[0].split(',');
  const products = rows.slice(1).map(r => {
    const cols = r.split(',');
    let obj = {};
    headers.forEach((h,i)=>obj[h.trim()] = cols[i] ? cols[i].trim() : "");
    return obj;
  });
  return products;
}

function safeName(title) {
  return title.replace(/[^a-z0-9]/gi, '-');
}

async function generatePages() {
  const products = await loadCSV();
  const catalog=document.getElementById('catalog');
  products.forEach((p,i)=>{
    const card=document.createElement('div');
    card.className='card';
    const img=p.IMAGE1 || p.IMAGE2 || '';
    const fileName = safeName(p.TITLE) + '.html';
    card.innerHTML=`<img src="${img}" alt=""><div class="title">${p.TITLE}</div>`;
    catalog.appendChild(card);

    // Generate the product page
    let pageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${p.TITLE}</title>
<style>
  body {font-family:sans-serif;margin:0;background:#fafafa;padding:20px;}
  .container {display:flex;gap:30px;align-items:flex-start;justify-content:center;flex-wrap:wrap;}
  .left {flex:1;max-width:500px;text-align:center;}
  .right {flex:1;max-width:300px;}
  img {max-width:100%;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
  .btns {margin-top:10px;}
  button {padding:8px 14px;margin:4px;border:none;background:#333;color:white;border-radius:6px;cursor:pointer;}
  button:hover {background:#555;}
  .back {margin-top:20px;display:inline-block;}
</style>
</head>
<body>
<div class="container">
  <div class="left">
    <img id="product-img" src="${p.IMAGE1}" alt="">
    <div class="btns">
      <button id="prev">Prev</button>
      <button id="next">Next</button>
    </div>
  </div>
  <div class="right">
    <h2>${p.TITLE}</h2>
    <p><b>Price:</b> ${p.PRICE} ${p.CURRENCY || ''}</p>
    <p><b>Quantity:</b> ${p.QUANTITY}</p>
    <a class="back" href="index.html">← Back to Catalog</a>
  </div>
</div>

<script>
  const imgs = [${[1,2,3,4,5,6,7,8,9,10].map(i=>p['IMAGE'+i]?`"${p['IMAGE'+i]}"`:'').filter(Boolean).join(',')}];
  let idx=0;
  document.getElementById('prev').onclick=()=>{idx=(idx-1+imgs.length)%imgs.length;document.getElementById('product-img').src=imgs[idx];};
  document.getElementById('next').onclick=()=>{idx=(idx+1)%imgs.length;document.getElementById('product-img').src=imgs[idx];};
</script>
</body>
</html>`;
    
    // Write file (only works in Node or local server; browser can't save files directly)
    // So instead of saving automatically, we create download link:
    const blob = new Blob([pageContent], {type: 'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Make clicking the card go to that product page
    card.onclick=()=>window.location.href=fileName;
  });
}

generatePages();
