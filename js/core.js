/* ============================================================
   SKYWATCH — SHARED CORE
   Runs on every page. Powers the HUD bar, nav, transitions,
   starfield background and scroll reveals.
   ============================================================ */

(function(){
  "use strict";

  /* ---------- LAUNCH-DAY ANCHOR (for "mission day" counter) ---------- */
  var FOUNDING = new Date("2024-01-01T00:00:00Z");

  /* ---------- HUD CLOCK ---------- */
  function pad(n){ return n.toString().padStart(2,"0"); }

  function updateHud(){
    var now = new Date();
    var utc = pad(now.getUTCHours())+":"+pad(now.getUTCMinutes())+":"+pad(now.getUTCSeconds());
    var local = pad(now.getHours())+":"+pad(now.getMinutes())+":"+pad(now.getSeconds());
    var dayMs = now - FOUNDING;
    var day = Math.floor(dayMs / 86400000);

    var elUtc = document.getElementById("hud-utc");
    var elLocal = document.getElementById("hud-local");
    var elDay = document.getElementById("hud-day");
    if(elUtc) elUtc.textContent = utc + " UTC";
    if(elLocal) elLocal.textContent = local + " LOCAL";
    if(elDay) elDay.textContent = "T+" + day;
  }
  updateHud();
  setInterval(updateHud, 1000);

  /* ---------- NAV: scrolled state + mobile toggle ---------- */
  var nav = document.querySelector("header.site-nav");
  var onScroll = function(){
    if(!nav) return;
    if(window.scrollY > 12){ nav.classList.add("scrolled"); }
    else{ nav.classList.remove("scrolled"); }
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var primaryNav = document.querySelector("nav.primary");
  if(toggle && primaryNav){
    toggle.addEventListener("click", function(){
      primaryNav.classList.toggle("open");
      toggle.classList.toggle("open");
    });
    primaryNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        primaryNav.classList.remove("open");
      });
    });
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.primary a").forEach(function(a){
    var href = a.getAttribute("href");
    if(href === path || (path === "" && href === "index.html")){
      a.classList.add("active");
    }
  });

  /* ---------- PAGE TRANSITIONS ---------- */
  // Veil element is injected so every page gets it without repeating markup.
  var veil = document.createElement("div");
  veil.id = "transition-veil";
  veil.innerHTML = '<div class="bars"><i></i><i></i><i></i><i></i><i></i></div>';
  document.body.appendChild(veil);
  document.body.classList.add("page-enter");

  // If the page is restored from back/forward cache, clear any leftover veil state.
  window.addEventListener("pageshow", function(e){
    if(e.persisted){
      document.body.classList.remove("veil-in", "veil-out");
    }
  });

  document.querySelectorAll('a[href$=".html"]').forEach(function(link){
    // Only intercept internal same-site links, not external ones.
    if(link.target === "_blank") return;
    var href = link.getAttribute("href");
    if(!href || href.indexOf("http") === 0) return;

    link.addEventListener("click", function(e){
      e.preventDefault();
      document.body.classList.add("veil-in");
      setTimeout(function(){
        window.location.href = href;
      }, 420);
    });
  });

  /* ---------- AMBIENT STARFIELD (canvas) ---------- */
  function initStarfield(canvas){
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize(){
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = Math.floor((w*h)/9000);
      stars = [];
      for(var i=0;i<count;i++){
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: Math.random()*1.2 + 0.2,
          tw: Math.random()*Math.PI*2,
          speed: Math.random()*0.015 + 0.005
        });
      }
    }
    var ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function frame(){
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){
        var s = stars[i];
        s.tw += s.speed;
        var alpha = 0.35 + Math.sin(s.tw)*0.35;
        ctx.beginPath();
        ctx.fillStyle = "rgba(232,236,242,"+Math.max(alpha,0.05)+")";
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fill();
      }
      if(!reduceMotion) requestAnimationFrame(frame);
    }
    frame();
  }
  document.querySelectorAll("canvas.starfield").forEach(initStarfield);

  /* ---------- SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- COUNTDOWN UTILITY (used by Launches page, exposed globally) ---------- */
  window.SkyWatch = window.SkyWatch || {};
  window.SkyWatch.formatCountdown = function(targetDate){
    var diff = targetDate - new Date();
    if(diff <= 0) return {d:0,h:0,m:0,s:0,past:true};
    var d = Math.floor(diff/86400000);
    var h = Math.floor((diff%86400000)/3600000);
    var m = Math.floor((diff%3600000)/60000);
    var s = Math.floor((diff%60000)/1000);
    return {d:d,h:h,m:m,s:s,past:false};
  };

})();
