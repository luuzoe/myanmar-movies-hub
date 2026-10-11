/* Myanmar Movies Hub — catalog renderer */
(function(){
  "use strict";
  var state = { data: [], tab: "myanmar", genre: "all", q: "" };

  var GENRES = {
    "all": "အားလုံး", "comedy": "ဟာသ", "horror": "ထိတ်လန့်", "thriller": "သည်းထိတ်",
    "sci-fi": "သိပ္ပံ", "noir": "နိုအာ", "mystery": "လျှို့ဝှက်", "drama": "ဒရာမာ",
    "romance": "အချစ်", "action": "အက်ရှင်", "documentary": "မှတ်တမ်း", "series": "ဇာတ်လမ်းတွဲ"
  };

  function embedUrl(m){
    if (m.source === "archive") return "https://archive.org/embed/" + encodeURIComponent(m.ref);
    if (m.source === "youtube") return "https://www.youtube.com/embed/" + encodeURIComponent(m.ref);
    if (m.source === "ytplaylist") return "https://www.youtube.com/embed/videoseries?list=" + encodeURIComponent(m.ref);
    return "";
  }

  function filtered(){
    var q = state.q.trim().toLowerCase();
    return state.data.filter(function(m){
      if (m.tab !== state.tab) return false;
      if (state.genre !== "all" && m.genre !== state.genre) return false;
      if (q && (m.title.toLowerCase().indexOf(q) < 0 && (m.title_my||"").toLowerCase().indexOf(q) < 0)) return false;
      return true;
    });
  }

  function renderChips(){
    var box = document.getElementById("chips");
    var used = {};
    state.data.forEach(function(m){ if (m.tab === state.tab) used[m.genre] = 1; });
    var keys = ["all"].concat(Object.keys(GENRES).filter(function(g){ return g !== "all" && used[g]; }));
    box.innerHTML = "";
    keys.forEach(function(g){
      var b = document.createElement("button");
      b.className = "chip" + (state.genre === g ? " active" : "");
      b.textContent = GENRES[g] || g;
      b.onclick = function(){ state.genre = g; render(); };
      box.appendChild(b);
    });
  }

  function render(){
    renderChips();
    var grid = document.getElementById("grid");
    var items = filtered();
    document.getElementById("empty").hidden = items.length > 0;
    grid.innerHTML = "";
    items.forEach(function(m, i){
      var card = document.createElement("div");
      card.className = "card";
      var img = document.createElement("img");
      img.loading = "lazy";
      img.src = m.poster;
      img.alt = m.title;
      img.onerror = function(){ this.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#1b1b28"/><text x="150" y="230" font-size="60" text-anchor="middle" fill="#555">🎬</text></svg>'); };
      var info = document.createElement("div");
      info.className = "info";
      var t = document.createElement("div"); t.className = "t"; t.textContent = m.title_my || m.title;
      var y = document.createElement("div"); y.className = "y"; y.textContent = m.year || "";
      var g = document.createElement("span"); g.className = "g"; g.textContent = GENRES[m.genre] || m.genre;
      info.appendChild(t); info.appendChild(y); info.appendChild(g);
      card.appendChild(img); card.appendChild(info);
      card.onclick = function(){ openModal(m); };
      grid.appendChild(card);
    });
  }

  function openModal(m){
    var player = document.getElementById("player");
    player.innerHTML = "";
    var f = document.createElement("iframe");
    f.src = embedUrl(m);
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    player.appendChild(f);
    document.getElementById("mTitle").textContent = (m.title_my ? m.title_my + " / " : "") + m.title;
    document.getElementById("mMeta").textContent = (m.year || "") + (m.year ? " · " : "") + (GENRES[m.genre] || m.genre);
    document.getElementById("mDesc").textContent = m.desc || "";
    document.getElementById("modal").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    document.getElementById("modal").hidden = true;
    document.getElementById("player").innerHTML = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll(".tab").forEach(function(t){
      t.onclick = function(){
        document.querySelectorAll(".tab").forEach(function(x){ x.classList.remove("active"); });
        t.classList.add("active");
        state.tab = t.getAttribute("data-tab");
        state.genre = "all";
        render();
      };
    });
    document.getElementById("search").addEventListener("input", function(e){
      state.q = e.target.value; render();
    });
    document.getElementById("modalClose").onclick = closeModal;
    document.getElementById("modalBackdrop").onclick = closeModal;
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeModal(); });

    fetch("movies.json?v=2").then(function(r){ return r.json(); }).then(function(d){
      state.data = d.movies || [];
      render();
    }).catch(function(){
      document.getElementById("empty").hidden = false;
      document.getElementById("empty").textContent = "ဒေတာဖတ်မရပါ — နောက်မှထပ်ကြိုးစားပါ။";
    });
  });
})();
