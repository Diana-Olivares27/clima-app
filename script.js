const API_KEY = '695b818cbfd29dd58a03aaa37c279d2d';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

const formulario = document.getElementById('formulario');
const inputCiudad = document.getElementById('inputCiudad');
const resultado = document.getElementById('resultado');
const estado = document.getElementById('estado');
const btnUbicacion = document.getElementById('btnUbicacion');
const pronosticoCont = document.getElementById('pronostico');
const historialCont = document.getElementById('historial');
const btnTema = document.getElementById('btnTema');

let historial = JSON.parse(localStorage.getItem('historial')) || [];
let ultimoClima = null;

function guardarEnHistorial(ciudad){
  historial = historial.filter(c => c.toLowerCase()!== ciudad.toLowerCase());
  historial.unshift(ciudad);
  if(historial.length > 5) historial.pop();
  localStorage.setItem('historial', JSON.stringify(historial));
  mostrarHistorial();
}
function mostrarHistorial(){
  if(historial.length === 0){ historialCont.innerHTML=''; return; }
  historialCont.innerHTML = historial.map(c => `<button class="historial-item" onclick="consultarClima('${c}')">📍 ${c}</button>`).join('') + `<button class="btn-limpiar" onclick="limpiarHistorial()">🗑️</button>`;
}
function limpiarHistorial(){ historial=[]; localStorage.removeItem('historial'); mostrarHistorial(); }

async function consultarClima(ciudad){
  estado.textContent='⏳ Consultando el clima...';
  resultado.classList.remove('visible');
  try{
    const url=`${API_URL}?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`;
    const res=await fetch(url);
    if(!res.ok){ if(res.status===404) throw new Error('Ciudad no encontrada'); throw new Error('Error '+res.status); }
    const datos=await res.json();
    mostrarClima(datos);
    consultarPronostico(ciudad);
    guardarEnHistorial(datos.name);
    estado.textContent='✅ Datos actualizados correctamente.';
  }catch(e){ estado.textContent=`❌ ${e.message}`; }
}

function mostrarClima(datos){
  ultimoClima=datos;
  resultado.innerHTML=`
    <div class="ciudad">${datos.name}</div>
    <div class="pais">${datos.sys.country}</div>
    <img src="https://openweathermap.org/img/wn/${datos.weather[0].icon}@2x.png" class="icono-clima" alt="${datos.weather[0].description}">
    <div class="temperatura">${Math.round(datos.main.temp)}°C</div>
    <div class="descripcion">${datos.weather[0].description}</div>
    <div class="detalles">
      <div class="detalle"><div class="etiqueta">Sensación</div><div class="valor">${Math.round(datos.main.feels_like)}°C</div></div>
      <div class="detalle"><div class="etiqueta">Humedad</div><div class="valor">${datos.main.humidity}%</div></div>
      <div class="detalle"><div class="etiqueta">Presión</div><div class="valor">${datos.main.pressure} hPa</div></div>
      <div class="detalle"><div class="etiqueta">Viento</div><div class="valor">${datos.wind.speed} m/s</div></div>
    </div>
    <button class="btn-whatsapp" onclick="compartirWhatsApp()">📲 Compartir en WhatsApp</button>
  `;
  resultado.classList.add('visible');
  cambiarFondo(datos.weather[0].main);
}
function cambiarFondo(clima){
  document.body.classList.remove('clima-soleado','clima-nublado','clima-lluvioso','clima-nieve');
  const c=clima.toLowerCase();
  if(c.includes('clear')) document.body.classList.add('clima-soleado');
  else if(c.includes('cloud')) document.body.classList.add('clima-nublado');
  else if(c.includes('rain')||c.includes('drizzle')||c.includes('thunder')) document.body.classList.add('clima-lluvioso');
  else if(c.includes('snow')) document.body.classList.add('clima-nieve');
}

formulario.addEventListener('submit', e=>{
  e.preventDefault();
  const ciudad=inputCiudad.value.trim();
  if(!ciudad){ estado.textContent='⚠️ Escribe el nombre de una ciudad.'; return; }
  consultarClima(ciudad);
  inputCiudad.value='';
});

async function consultarClimaPorCoords(lat,lon){
  estado.textContent='📍 Obteniendo ubicación...';
  try{
    const datos=await (await fetch(`${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`)).json();
    mostrarClima(datos);
    consultarPronosticoPorCoords(lat,lon);
    guardarEnHistorial(datos.name);
    estado.textContent='📍 Clima de tu ubicación actual';
  }catch(e){ estado.textContent='❌ '+e.message; }
}
btnUbicacion.addEventListener('click',()=>{
  if(!navigator.geolocation){ estado.textContent='Tu navegador no soporta GPS'; return; }
  estado.textContent='📍 Buscando ubicación...';
  navigator.geolocation.getCurrentPosition(p=>consultarClimaPorCoords(p.coords.latitude,p.coords.longitude),()=>estado.textContent='❌ Activa el permiso de ubicación');
});

async function consultarPronostico(ciudad){
  try{
    const datos=await (await fetch(`${API_FORECAST}?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`)).json();
    mostrarPronostico(datos);
  }catch(e){}
}
async function consultarPronosticoPorCoords(lat,lon){
  try{
    const datos=await (await fetch(`${API_FORECAST}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`)).json();
    mostrarPronostico(datos);
  }catch(e){}
}
function mostrarPronostico(datos){
  pronosticoCont.innerHTML='<h3>📅 Pronóstico 5 días</h3>';
  datos.list.filter((_,i)=>i%8===0).forEach(dia=>{
    const fecha=new Date(dia.dt*1000).toLocaleDateString('es-MX',{weekday:'short',day:'numeric'});
    pronosticoCont.innerHTML+=`<div class="dia-pronostico"><p><b>${fecha}</b></p><img src="https://openweathermap.org/img/wn/${dia.weather[0].icon}.png"><p>${Math.round(dia.main.temp)}°C</p><small>${dia.weather[0].description}</small></div>`;
  });
}

const temaGuardado=localStorage.getItem('temaClima');
if(temaGuardado==='oscuro'){ document.body.classList.add('modo-oscuro'); btnTema.textContent='☀️ Modo Claro'; }
btnTema.addEventListener('click',()=>{
  document.body.classList.toggle('modo-oscuro');
  if(document.body.classList.contains('modo-oscuro')){ localStorage.setItem('temaClima','oscuro'); btnTema.textContent='☀️ Modo Claro'; }
  else{ localStorage.setItem('temaClima','claro'); btnTema.textContent='🌙 Modo Oscuro'; }
});

function compartirWhatsApp(){
  if(!ultimoClima) return;
  const texto=`🌤️ El clima en ${ultimoClima.name} es ${Math.round(ultimoClima.main.temp)}°C, ${ultimoClima.weather[0].description}. Humedad ${ultimoClima.main.humidity}% - App de Diana`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`,'_blank');
}

mostrarHistorial();