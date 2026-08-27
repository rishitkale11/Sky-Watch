/* ============================================================
   LAUNCH COUNTDOWN PAGE
   Data: Launch Library 2 (free, public, no API key) by The Space Devs.
   ============================================================ */
(function(){
  "use strict";

  var API = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=8&mode=detailed";
  var heroEl = document.getElementById("hero-countdown");
  var listEl = document.getElementById("launch-list");
  var launches = [];
  var heroTarget = null;
  var heroLaunch = null;

  function pad(n){ return n.toString().padStart(2,"0"); }

  function statusClass(statusName){
    if(!statusName) return "";
    var s = statusName.toLowerCase();
    if(s.indexOf("go") === 0) return "go";
    if(s.indexOf("tbd") === 0 || s.indexOf("hold") >= 0) return "tbd";
    return "";
  }

  function renderHero(){
    if(!heroLaunch){
      heroEl.innerHTML = '<span class="mono hc-status">NO UPCOMING LAUNCHES FOUND — CHECK BACK SOON.</span>';
      return;
    }
    heroEl.innerHTML =
      '<span class="hc-mission mono">NEXT LAUNCH</span>' +
      '<h2 class="hc-name">'+heroLaunch.name+'</h2>' +
      '<div class="hc-clock">' +
        '<div class="hc-unit"><span class="hc-num" id="hc-d">--</span><span class="hc-label">Days</span></div>' +
        '<div class="hc-unit"><span class="hc-num" id="hc-h">--</span><span class="hc-label">Hours</span></div>' +
        '<div class="hc-unit"><span class="hc-num" id="hc-m">--</span><span class="hc-label">Min</span></div>' +
        '<div class="hc-unit"><span class="hc-num" id="hc-s">--</span><span class="hc-label">Sec</span></div>' +
      '</div>' +
      '<p class="hc-meta">' +
        (heroLaunch.pad && heroLaunch.pad.location ? heroLaunch.pad.location.name : "Location TBD") +
        ' · <span>' + (heroLaunch.status ? heroLaunch.status.name : "TBD") + '</span>' +
      '</p>';
  }

  function tickHero(){
    if(!heroTarget) return;
    var c = window.SkyWatch.formatCountdown(heroTarget);
    var dEl = document.getElementById("hc-d");
    if(!dEl) return;
    if(c.past){
      heroEl.querySelector(".hc-clock").innerHTML = '<span class="mono" style="color:var(--telemetry);font-size:1.4rem;">LIFTOFF</span>';
      return;
    }
    document.getElementById("hc-d").textContent = pad(c.d);
    document.getElementById("hc-h").textContent = pad(c.h);
    document.getElementById("hc-m").textContent = pad(c.m);
    document.getElementById("hc-s").textContent = pad(c.s);
  }

  function renderList(){
    if(!launches.length){
      listEl.innerHTML = '<p class="mono" style="color:var(--ink-faint);padding:1.5rem;">No upcoming launches found right now.</p>';
      return;
    }
    listEl.innerHTML = "";
    launches.forEach(function(launch){
      var date = new Date(launch.net);
      var row = document.createElement("div");
      row.className = "launch-row";
      var statusName = launch.status ? launch.status.name : "TBD";
      row.innerHTML =
        '<div class="lr-date"><b>'+ date.toLocaleDateString(undefined,{day:"2-digit",month:"short"}) +'</b>'+ date.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}) +'</div>' +
        '<div class="lr-main"><h4>'+launch.name+'</h4><span>'+ (launch.pad && launch.pad.location ? launch.pad.location.name : "Location TBD") +'</span></div>' +
        '<span class="lr-status '+statusClass(statusName)+'">'+statusName+'</span>' +
        '<span class="lr-countdown mono" data-net="'+launch.net+'">--:--:--:--</span>';
      listEl.appendChild(row);
    });
  }

  function tickList(){
    document.querySelectorAll(".lr-countdown").forEach(function(el){
      var net = new Date(el.getAttribute("data-net"));
      var c = window.SkyWatch.formatCountdown(net);
      el.textContent = c.past ? "LAUNCHED" : (c.d+"d "+pad(c.h)+":"+pad(c.m)+":"+pad(c.s));
    });
  }

  fetch(API)
    .then(function(r){
      if(!r.ok) throw new Error("Launch service unavailable");
      return r.json();
    })
    .then(function(data){
      launches = (data.results || []);
      if(launches.length){
        heroLaunch = launches[0];
        heroTarget = new Date(heroLaunch.net);
      }
      renderHero();
      renderList();
      tickHero();
      tickList();
      setInterval(tickHero, 1000);
      setInterval(tickList, 1000);
    })
    .catch(function(err){
      heroEl.innerHTML = '<span class="mono hc-status">COULD NOT REACH LAUNCH SCHEDULE SERVICE. TRY REFRESHING.</span>';
      listEl.innerHTML = '<p class="mono" style="color:var(--ink-faint);padding:1.5rem;">Schedule unavailable right now.</p>';
      console.error(err);
    });

})();
