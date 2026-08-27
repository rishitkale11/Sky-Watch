/* ============================================================
   ISS TRACKER PAGE
   Live position from wheretheiss.at (free, no API key).
   ============================================================ */
(function(){
  "use strict";

  var map = L.map("iss-map", {
    worldCopyJump:true,
    minZoom:2
  }).setView([0, 0], 2.2);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:'&copy; CARTO &copy; OpenStreetMap',
    subdomains:"abcd",
    maxZoom:19
  }).addTo(map);

  var issIconHtml =
    '<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;">' +
      '<svg viewBox="0 0 64 64" width="26" height="26"><g fill="none" stroke="#FF5A1F" stroke-width="3"><rect x="26" y="14" width="12" height="36" rx="2"/><rect x="6" y="22" width="16" height="20" rx="1"/><rect x="42" y="22" width="16" height="20" rx="1"/><line x1="22" y1="32" x2="26" y2="32"/><line x1="38" y1="32" x2="42" y2="32"/></g></svg>' +
    '</div>';
  var issIcon = L.divIcon({className:"", html:issIconHtml, iconSize:[26,26], iconAnchor:[13,13]});

  var marker = L.marker([0,0], {icon:issIcon}).addTo(map);
  var trail = L.polyline([], {color:"#3DDC97", weight:1.5, opacity:0.6, dashArray:"3,5"}).addTo(map);
  var trailPoints = [];
  var hasCentered = false;

  function fetchPosition(){
    fetch("https://api.wheretheiss.at/v1/satellites/25544")
      .then(function(r){
        if(!r.ok) throw new Error("ISS service unavailable");
        return r.json();
      })
      .then(function(data){
        var lat = data.latitude, lon = data.longitude;
        marker.setLatLng([lat, lon]);

        trailPoints.push([lat, lon]);
        if(trailPoints.length > 60) trailPoints.shift();
        trail.setLatLngs(trailPoints);

        if(!hasCentered){
          map.setView([lat, lon], 3);
          hasCentered = true;
        }

        document.getElementById("iss-lat").textContent = lat.toFixed(4) + "°";
        document.getElementById("iss-lon").textContent = lon.toFixed(4) + "°";
        document.getElementById("iss-alt").textContent = data.altitude.toFixed(1) + " km";
        document.getElementById("iss-vel").textContent = data.velocity.toFixed(0) + " km/h";
        document.getElementById("iss-vis").textContent = data.visibility === "daylight" ? "Daylight pass" : "In darkness";

        reverseGeocode(lat, lon);

        var now = new Date();
        document.getElementById("iss-updated").textContent =
          "Last update " + now.toLocaleTimeString();
      })
      .catch(function(err){
        document.getElementById("iss-updated").textContent = "Telemetry link lost — retrying…";
        console.error(err);
      });
  }

  var lastGeoKey = null;
  function reverseGeocode(lat, lon){
    // Round to limit calls; ocean vs landmass naming via lightweight reverse geocode.
    var key = lat.toFixed(0) + "," + lon.toFixed(0);
    if(key === lastGeoKey) return;
    lastGeoKey = key;

    fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+lat+"&longitude="+lon+"&localityLanguage=en")
      .then(function(r){ return r.json(); })
      .then(function(d){
        var place = d.countryName ? (d.principalSubdivision ? d.principalSubdivision + ", " + d.countryName : d.countryName) : "Open Ocean";
        document.getElementById("iss-over").textContent = place;
      })
      .catch(function(){
        document.getElementById("iss-over").textContent = "Unavailable";
      });
  }

  fetchPosition();
  setInterval(fetchPosition, 5000);

})();
