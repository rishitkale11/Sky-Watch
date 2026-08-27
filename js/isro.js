/* ============================================================
   ISRO MISSION TIMELINE
   Static, fact-checked dataset rendered into the timeline DOM.
   ============================================================ */
(function(){
  "use strict";

  var missions = [
    {
      year:"1969",
      title:"ISRO Is Founded",
      tag:"Foundation",
      body:"The Indian Space Research Organisation is established on 15 August 1969, succeeding the earlier Indian National Committee for Space Research, under the guidance of Dr. Vikram Sarabhai."
    },
    {
      year:"1975",
      title:"Aryabhata",
      tag:"First Satellite",
      body:"India's first satellite, named after the 5th-century mathematician and astronomer, is launched aboard a Soviet rocket — marking the country's entry into space technology."
    },
    {
      year:"1980",
      title:"Rohini (RS-1)",
      tag:"First Indigenous Launch",
      body:"Launched aboard the SLV-3, India's first indigenously-built satellite launch vehicle, Rohini becomes the first satellite placed into orbit by an Indian-made rocket."
    },
    {
      year:"2008",
      title:"Chandrayaan-1",
      tag:"Lunar Orbiter",
      body:"India's first mission to the Moon. Its Moon Impact Probe and onboard instruments contributed to confirming the presence of water molecules on the lunar surface."
    },
    {
      year:"2013",
      title:"Mangalyaan — Mars Orbiter Mission",
      tag:"Interplanetary",
      body:"India becomes the first nation to reach Mars orbit on its very first attempt, and the first Asian country to reach the planet at all."
    },
    {
      year:"2014",
      title:"GSLV Mk III Maiden Flight",
      tag:"Launch Vehicle",
      body:"The experimental flight of India's heaviest launch vehicle to date paves the way for larger payloads — and eventually, a human-rated rocket."
    },
    {
      year:"2017",
      title:"104 Satellites, One Launch",
      tag:"Record Launch",
      body:"A single PSLV mission deploys 104 satellites in one launch, at the time a world record for the most satellites carried by a single rocket."
    },
    {
      year:"2019",
      title:"Chandrayaan-2",
      tag:"Lunar Mission",
      body:"An orbiter, lander, and rover head to the Moon. The orbiter succeeds and continues operating; the Vikram lander is lost during descent, a lesson folded directly into Chandrayaan-3."
    },
    {
      year:"2023",
      title:"Chandrayaan-3",
      tag:"South Pole Landing",
      body:"On 23 August 2023, the Vikram lander achieves a soft landing near the lunar south pole — making India the first country to land in that region, and the fourth to soft-land on the Moon at all."
    },
    {
      year:"2023",
      title:"Aditya-L1",
      tag:"Solar Observatory",
      body:"India's first dedicated mission to study the Sun, placed in a halo orbit around the Sun-Earth L1 point to continuously observe the solar corona and wind."
    },
    {
      year:"2023–24",
      title:"Gaganyaan Test Campaign",
      tag:"Human Spaceflight",
      body:"Uncrewed abort and test flights begin for Gaganyaan, India's indigenous human spaceflight programme, validating the crew escape system ahead of a future crewed orbital mission."
    },
    {
      year:"2028–35",
      title:"Bharatiya Antariksh Station",
      tag:"Planned",
      body:"India's proposed space station, planned for development in phases — intended as the country's first sustained human presence in orbit."
    }
  ];

  var container = document.getElementById("timeline");
  var html = "";
  missions.forEach(function(m){
    html +=
      '<div class="tl-entry reveal">' +
        '<span class="tl-year mono">'+m.year+'</span>' +
        '<h3>'+m.title+'</h3>' +
        '<p>'+m.body+'</p>' +
        '<span class="tl-tag">'+m.tag+'</span>' +
      '</div>';
  });
  container.innerHTML = html;

  // Re-run reveal observer for the newly injected nodes.
  var revealEls = container.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  }

})();
