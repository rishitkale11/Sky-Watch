/* ============================================================
   FORECAST PAGE
   Uses Open-Meteo (free, no API key) for geocoding + weather.
   ============================================================ */
(function(){
  "use strict";

  var GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
  var WX_URL  = "https://api.open-meteo.com/v1/forecast";

  var els = {
    form: document.getElementById("city-form"),
    input: document.getElementById("city-input"),
    locateBtn: document.getElementById("locate-btn"),
    suggestions: document.getElementById("search-suggestions"),
    status: document.getElementById("loc-status"),
    curPlace: document.getElementById("cur-place"),
    curIcon: document.getElementById("cur-icon"),
    curTemp: document.getElementById("cur-temp"),
    curDesc: document.getElementById("cur-desc"),
    curFeels: document.getElementById("cur-feels"),
    curHumidity: document.getElementById("cur-humidity"),
    curWind: document.getElementById("cur-wind"),
    curPrecip: document.getElementById("cur-precip"),
    cards: document.getElementById("forecast-cards")
  };

  var chart = null;

  /* ---------- WMO weather code → icon + label ---------- */
  // Minimal inline SVG icon set, drawn directly (no external icon dependency).
  function iconFor(code, isDay){
    var sun = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="13" fill="#FFC94A"/><g stroke="#FFC94A" stroke-width="3" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="18" y2="18"/><line x1="46" y1="46" x2="52" y2="52"/><line x1="12" y1="52" x2="18" y2="46"/><line x1="46" y1="18" x2="52" y2="12"/></g></svg>';
    var moon = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 8a24 24 0 100 48 20 20 0 010-48z" fill="#8C97AC"/></svg>';
    var cloud = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 42a12 12 0 01-1-24 14 14 0 0127-4 11 11 0 0110 12 11 11 0 01-2 16H20z" fill="#A9B3C4"/></svg>';
    var partly = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="10" fill="#FFC94A"/><path d="M26 46a12 12 0 01-1-24 14 14 0 0127-3 11 11 0 0110 12 11 11 0 01-2 15H26z" fill="#A9B3C4"/></svg>';
    var rain = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 36a12 12 0 01-1-24 14 14 0 0127-4 11 11 0 0110 12 11 11 0 01-2 16H20z" fill="#A9B3C4"/><g stroke="#3DDC97" stroke-width="3" stroke-linecap="round"><line x1="22" y1="46" x2="19" y2="56"/><line x1="34" y1="46" x2="31" y2="56"/><line x1="46" y1="46" x2="43" y2="56"/></g></svg>';
    var storm = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 32a12 12 0 01-1-24 14 14 0 0127-3 11 11 0 0110 12 11 11 0 01-2 15H20z" fill="#7E8AA0"/><path d="M34 40l-8 12h7l-4 9 13-15h-7l5-6z" fill="#FFC94A"/></svg>';
    var snow = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 36a12 12 0 01-1-24 14 14 0 0127-4 11 11 0 0110 12 11 11 0 01-2 16H20z" fill="#A9B3C4"/><g stroke="#E8ECF2" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="46" x2="22" y2="56"/><line x1="17" y1="51" x2="27" y2="51"/><line x1="42" y1="46" x2="42" y2="56"/><line x1="37" y1="51" x2="47" y2="51"/></g></svg>';
    var fog = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#8C97AC" stroke-width="4" stroke-linecap="round"><line x1="10" y1="24" x2="54" y2="24"/><line x1="6" y1="34" x2="58" y2="34"/><line x1="10" y1="44" x2="54" y2="44"/></g></svg>';

    if(code === 0) return isDay ? sun : moon;
    if(code === 1 || code === 2) return partly;
    if(code === 3) return cloud;
    if(code === 45 || code === 48) return fog;
    if(code >= 51 && code <= 67) return rain;
    if(code >= 71 && code <= 77) return snow;
    if(code >= 80 && code <= 82) return rain;
    if(code >= 85 && code <= 86) return snow;
    if(code >= 95) return storm;
    return cloud;
  }

  function labelFor(code){
    var map = {
      0:"Clear sky", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast",
      45:"Fog", 48:"Freezing fog",
      51:"Light drizzle", 53:"Drizzle", 55:"Dense drizzle",
      61:"Light rain", 63:"Rain", 65:"Heavy rain",
      71:"Light snow", 73:"Snow", 75:"Heavy snow", 77:"Snow grains",
      80:"Rain showers", 81:"Rain showers", 82:"Violent showers",
      85:"Snow showers", 86:"Heavy snow showers",
      95:"Thunderstorm", 96:"Thunderstorm + hail", 99:"Severe thunderstorm"
    };
    return map[code] || "Unsettled";
  }

  /* ---------- core fetch + render ---------- */
  function loadWeather(lat, lon, label){
    els.status.textContent = "FETCHING TELEMETRY…";
    var url = WX_URL + "?latitude="+lat+"&longitude="+lon+
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,precipitation_probability"+
      "&hourly=temperature_2m,precipitation_probability,weather_code"+
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"+
      "&timezone=auto&forecast_days=7";

    fetch(url)
      .then(function(r){
        if(!r.ok) throw new Error("Weather service unavailable");
        return r.json();
      })
      .then(function(data){
        renderCurrent(data, label);
        renderDaily(data);
        renderHourly(data);
        els.status.textContent = "";
      })
      .catch(function(err){
        els.status.textContent = "COULD NOT REACH WEATHER SERVICE — TRY AGAIN.";
        console.error(err);
      });
  }

  function renderCurrent(data, label){
    var c = data.current;
    els.curPlace.textContent = label;
    els.curIcon.innerHTML = iconFor(c.weather_code, c.is_day);
    document.getElementById("cur-temp").textContent = Math.round(c.temperature_2m) + "°C";
    document.getElementById("cur-desc").textContent = labelFor(c.weather_code);
    els.curFeels.textContent = Math.round(c.apparent_temperature) + "°C";
    els.curHumidity.textContent = c.relative_humidity_2m + "%";
    els.curWind.textContent = Math.round(c.wind_speed_10m) + " km/h";
    els.curPrecip.textContent = (c.precipitation_probability != null ? c.precipitation_probability : 0) + "%";
  }

  function renderDaily(data){
    var d = data.daily;
    els.cards.innerHTML = "";
    var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    for(var i=0;i<d.time.length;i++){
      var date = new Date(d.time[i] + "T00:00:00");
      var card = document.createElement("div");
      card.className = "fc-card" + (i===0 ? " today" : "");
      card.innerHTML =
        '<span class="fc-day mono">'+ dayNames[date.getDay()] +'</span>' +
        '<span class="fc-icon">'+ iconFor(d.weather_code[i], true) +'</span>' +
        '<div class="fc-temp-row"><span class="fc-high">'+ Math.round(d.temperature_2m_max[i]) +'°</span><span class="fc-low">'+ Math.round(d.temperature_2m_min[i]) +'°</span></div>' +
        '<span class="fc-precip mono">'+ (d.precipitation_probability_max[i] || 0) +'% rain</span>';
      els.cards.appendChild(card);
    }
  }

  function renderHourly(data){
    var h = data.hourly;
    var labels = [], temps = [], precip = [];
    var limit = Math.min(48, h.time.length);
    for(var i=0;i<limit;i++){
      var dt = new Date(h.time[i]);
      labels.push(dt.getHours()+":00");
      temps.push(h.temperature_2m[i]);
      precip.push(h.precipitation_probability[i]);
    }

    var ctx = document.getElementById("hourly-chart").getContext("2d");
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type:"line",
      data:{
        labels:labels,
        datasets:[
          {
            label:"Temp (°C)",
            data:temps,
            borderColor:"#FF5A1F",
            backgroundColor:"rgba(255,90,31,0.08)",
            borderWidth:2,
            tension:0.35,
            pointRadius:0,
            fill:true,
            yAxisID:"y"
          },
          {
            label:"Precip. chance (%)",
            data:precip,
            borderColor:"#3DDC97",
            backgroundColor:"rgba(61,220,151,0.06)",
            borderWidth:1.5,
            tension:0.35,
            pointRadius:0,
            fill:false,
            yAxisID:"y1"
          }
        ]
      },
      options:{
        responsive:true,
        interaction:{mode:"index",intersect:false},
        plugins:{
          legend:{labels:{color:"#8C97AC",font:{family:"JetBrains Mono",size:10}}},
          tooltip:{backgroundColor:"#0B0F1A",borderColor:"#1C2436",borderWidth:1}
        },
        scales:{
          x:{ticks:{color:"#535D72",maxTicksLimit:12,font:{size:10}},grid:{color:"#1C2436"}},
          y:{ticks:{color:"#8C97AC",font:{size:10}},grid:{color:"#1C2436"},title:{display:true,text:"°C",color:"#535D72"}},
          y1:{position:"right",ticks:{color:"#535D72",font:{size:10}},grid:{display:false},min:0,max:100,title:{display:true,text:"%",color:"#535D72"}}
        }
      }
    });
  }

  /* ---------- geocoding ---------- */
  function searchCity(query){
    els.status.textContent = "SEARCHING…";
    fetch(GEO_URL + "?name=" + encodeURIComponent(query) + "&count=5&language=en")
      .then(function(r){ return r.json(); })
      .then(function(data){
        els.suggestions.innerHTML = "";
        if(!data.results || !data.results.length){
          els.status.textContent = "NO MATCHES FOUND.";
          return;
        }
        els.status.textContent = "";
        data.results.forEach(function(place){
          var btn = document.createElement("button");
          var region = [place.admin1, place.country].filter(Boolean).join(", ");
          btn.textContent = place.name + (region ? " — " + region : "");
          btn.addEventListener("click", function(){
            els.suggestions.innerHTML = "";
            els.input.value = place.name;
            loadWeather(place.latitude, place.longitude, place.name + (region ? ", " + region : ""));
          });
          els.suggestions.appendChild(btn);
        });
      })
      .catch(function(){
        els.status.textContent = "SEARCH SERVICE UNAVAILABLE.";
      });
  }

  els.form.addEventListener("submit", function(e){
    e.preventDefault();
    var q = els.input.value.trim();
    if(q) searchCity(q);
  });

  els.locateBtn.addEventListener("click", function(){
    if(!navigator.geolocation){
      els.status.textContent = "GEOLOCATION NOT SUPPORTED ON THIS DEVICE.";
      return;
    }
    els.status.textContent = "REQUESTING LOCATION…";
    navigator.geolocation.getCurrentPosition(
      function(pos){
        loadWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
      },
      function(){
        els.status.textContent = "LOCATION ACCESS DENIED — SEARCH A CITY INSTEAD.";
      }
    );
  });

  /* ---------- default load ---------- */
  loadWeather(18.5204, 73.8567, "Pune, India");

})();
