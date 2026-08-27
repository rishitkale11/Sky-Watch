/* ============================================================
   HOME PAGE — status strip live data
   ============================================================ */
(function(){
  "use strict";

  var footDay = document.getElementById("hud-day-foot");
  function syncFootDay(){
    var dayEl = document.getElementById("hud-day");
    if(dayEl && footDay) footDay.textContent = dayEl.textContent;
  }
  setInterval(syncFootDay, 1000);

  // Pull next launch from Launch Library 2 API for the homepage status strip + mini countdown.
  var nextLaunchTarget = null;

  fetch("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&mode=detailed")
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.results && data.results[0]){
        var launch = data.results[0];
        var name = launch.name || "Upcoming Launch";
        nextLaunchTarget = new Date(launch.net);
        var el = document.getElementById("stat-next-launch");
        if(el) el.textContent = name.length > 26 ? name.slice(0,24)+"…" : name;
      }
    })
    .catch(function(){
      var el = document.getElementById("stat-next-launch");
      if(el) el.textContent = "See Launches →";
    });

  function tickMini(){
    var el = document.getElementById("dash-mini-countdown");
    if(!el) return;
    if(!nextLaunchTarget){
      el.textContent = "--:--:--";
      return;
    }
    var c = window.SkyWatch.formatCountdown(nextLaunchTarget);
    if(c.past){ el.textContent = "LIFTOFF"; return; }
    el.textContent = pad(c.d) + "d " + pad(c.h) + ":" + pad(c.m) + ":" + pad(c.s);
  }
  function pad(n){ return n.toString().padStart(2,"0"); }
  setInterval(tickMini, 1000);
  tickMini();

})();
