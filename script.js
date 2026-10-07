// App del Clima - Práctica API OpenWeatherMap
const API_KEY = '695b818cbfd29dd58a03aaa37c279d2d';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Referencias al DOM - Parte 4 del PDF
const formulario = document.getElementById('formulario');
const inputCiudad = document.getElementById('inputCiudad');
const resultado = document.getElementById('resultado');
const estado = document.getElementById('estado');

// Función principal con fetch y try/catch - Parte 5
async function consultarClima(ciudad) {
  estado.textContent = '⏳ Consultando el clima...';
  resultado.classList.remove('visible');

  try {
    // Construcción de URL con encodeURIComponent - requisito del PDF
    const url = `${API_URL}?q=${encodeURIComponent(ciudad)}&appid=${API_KEY}&units=metric&lang=es`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      if (respuesta.status === 404) {
        throw new Error('Ciudad no encontrada');
      }
      if (respuesta.status === 401) {
        throw new Error('API Key inválida o no activada aún');
      }
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    mostrarClima(datos);
    estado.textContent = '✅ Datos actualizados correctamente.';

  } catch (error) {
    estado.textContent = `❌ ${error.message}. Intenta con otra ciudad.`;
    resultado.classList.remove('visible');
  }
}

// Mostrar datos con template literals - Parte 6
function mostrarClima(datos) {
  const icono = datos.weather[0].icon;
  const urlIcono = `https://openweathermap.org/img/wn/${icono}@2x.png`;

  resultado.innerHTML = `
    <div class="ciudad">${datos.name}, ${datos.sys.country}</div>
    <img src="${urlIcono}" alt="${datos.weather[0].description}">
    <div class="temperatura">${Math.round(datos.main.temp)}°C</div>
    <div class="descripcion">${datos.weather[0].description}</div>
    <div class="detalles">
      <p>🌡️ Sensación térmica: ${Math.round(datos.main.feels_like)}°C</p>
      <p>💧 Humedad: ${datos.main.humidity}%</p>
      <p>💨 Viento: ${datos.wind.speed} m/s</p>
      <p>🔽 Presión: ${datos.main.pressure} hPa</p>
    </div>
  `;

  resultado.classList.add('visible');
  cambiarFondoSegunClima(datos.weather[0].main);
}

// Cambiar fondo según clima - Parte 8
function cambiarFondoSegunClima(clima) {
  document.body.classList.remove('clima-soleado', 'clima-nublado', 'clima-lluvioso', 'clima-nieve');

  const climaLower = clima.toLowerCase();

  if (climaLower.includes('clear')) {
    document.body.classList.add('clima-soleado');
  } else if (climaLower.includes('cloud')) {
    document.body.classList.add('clima-nublado');
  } else if (climaLower.includes('rain') || climaLower.includes('drizzle') || climaLower.includes('thunderstorm')) {
    document.body.classList.add('clima-lluvioso');
  } else if (climaLower.includes('snow')) {
    document.body.classList.add('clima-nieve');
  }
}

// Evento submit del formulario - Parte 7
formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const ciudad = inputCiudad.value.trim();

  if (!ciudad) {
    estado.textContent = '⚠️ Por favor escribe el nombre de una ciudad.';
    return;
  }

  consultarClima(ciudad);
});

// Mensaje inicial
estado.textContent = 'Escribe una ciudad y presiona "Consultar".';