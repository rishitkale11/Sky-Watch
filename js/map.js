/* ============================================================
   WORLD MAP PAGE
   Leaflet + CARTO dark tiles (free, no key) + Open-Meteo on click.
   ============================================================ */
(function(){
  "use strict";

  var map = L.map("leaflet-map", {
    worldCopyJump:true,
    minZoom:2
  }).setView([20, 0], 2.4);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:'&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains:"abcd",
    maxZoom:19
  }).addTo(map);

  var marker = null;
  var readout = document.getElementById("map-readout");

  var ignitionIcon = L.divIcon({
    className:"",
    html:'<div style="width:14px;height:14px;border-radius:50%;background:#FF5A1F;box-shadow:0 0 0 4px rgba(255,90,31,0.25),0 0 14px #FF5A1F;"></div>',
    iconSize:[14,14],
    iconAnchor:[7,7]
  });

  function setReadout(title, sub){
    readout.innerHTML =
      '<span class="map-readout-title">'+title+'</span>' +
      '<span class="map-readout-sub">'+sub+'</span>';
  }

  map.on("click", function(e){
    var lat = e.latlng.lat.toFixed(3);
    var lon = e.latlng.lng.toFixed(3);

    if(marker) map.removeLayer(marker);
    marker = L.marker(e.latlng, {icon:ignitionIcon}).addTo(map);

    setReadout(lat + "°, " + lon + "°", "FETCHING CONDITIONS…");

    fetch("https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,weather_code,wind_speed_10m")
      .then(function(r){ return r.json(); })
      .then(function(data){
        var c = data.current;
        setReadout(
          Math.round(c.temperature_2m) + "°C · " + lat + "°, " + lon + "°",
          "Wind " + Math.round(c.wind_speed_10m) + " km/h — click Forecast for the full outlook"
        );
        marker.bindPopup(
          "<strong>"+lat+"°, "+lon+"°</strong><br>" +
          Math.round(c.temperature_2m) + "°C · Wind " + Math.round(c.wind_speed_10m) + " km/h"
        ).openPopup();
      })
      .catch(function(){
        setReadout(lat + "°, " + lon + "°", "Could not fetch live conditions for this point.");
      });
  });

  setReadout("NO PIN DROPPED", "Click the map to sample a point");

})();
