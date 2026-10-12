/* Myanmar Movies Hub — catalog renderer */
(function(){
  "use strict";
  var state = { data: [], tab: "myanmar", genre: "all", q: "", limit: 60 };
  var PAGE = 60;

  var GENRES = {
    "all": "အားလုံး", "comedy": "ဟာသ", "horror": "ထိတ်လန့်", "thriller": "သည်းထိတ်",
    "sci-fi": "သိပ္ပံ", "noir": "နိုအာ", "mystery": "လျှို့ဝှက်", "drama": "ဒရာမာ",
    "romance": "အချစ်", "action": "အက်ရှင်", "documentary": "မှတ်တမ်း", "series": "ဇာတ်လမ်းတွဲ"
  };

  function embedUrl(m){
    if (m.source === "archive") return "https://archive.org/embed/" + encodeURIComponent(m.ref);
    if (m.source === "youtube") return "https://www.youtube.com/embed/" + encodeURIComponent(m.ref) + "?rel=0&modestbranding=1";
    if (m.source === "ytplaylist") return "https://www.youtube.com/embed/videoseries?list=" + encodeURIComponent(m.ref) + "&rel=0&modestbranding=1";
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
      b.onclick = function(){ state.genre = g; state.limit = PAGE; render(); };
      box.appendChild(b);
    });
  }

  function render(){
    renderChips();
    var grid = document.getElementById("grid");
    var items = filtered();
    document.getElementById("empty").hidden = items.length > 0;
    grid.innerHTML = "";
    grid.className = "grid-posters";
    var shown = items.slice(0, state.limit);
    shown.forEach(function(m){ grid.appendChild(posterCard(m)); });
    // Load-more button
    var old = document.getElementById("moreBtn");
    if (old) old.remove();
    if (items.length > shown.length) {
      var btn = document.createElement("button");
      btn.id = "moreBtn";
      btn.className = "more-btn";
      btn.textContent = "နောက်ထပ် " + (items.length - shown.length) + " ကား ကြည့်ရန် ⬇";
      btn.onclick = function(){ state.limit += PAGE; render(); };
      grid.parentNode.appendChild(btn);
    }
  }

  function posterImg(m, cls){
    var img = document.createElement("img");
    img.className = cls || "";
    img.loading = "lazy";
    img.src = m.poster;
    img.alt = m.title;
    img.onerror = function(){ this.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#1b1b28"/><text x="150" y="230" font-size="60" text-anchor="middle" fill="#555">🎬</text></svg>'); };
    return img;
  }

  function posterCard(m){
    var card = document.createElement("div");
    card.className = "pcard";
    card.appendChild(posterImg(m));
    if (m.rating) {
      var rb = document.createElement("span"); rb.className = "prate";
      rb.textContent = "⭐ " + m.rating;
      card.appendChild(rb);
    }
    var ov = document.createElement("div"); ov.className = "ov";
    var t = document.createElement("div"); t.className = "pt";
    t.textContent = (m.title_my || m.title) + (m.year ? " (" + m.year + ")" : "");
    var b = document.createElement("span"); b.className = "wb";
    b.textContent = "▶ ဇာတ်ကားကြည့်ရန်";
    ov.appendChild(t); ov.appendChild(b);
    card.appendChild(ov);
    card.onclick = function(){ openModal(m); };
    return card;
  }

  function blogCard(m){
      var card = document.createElement("div");
      card.className = "card";
      var img = posterImg(m, "p");
      var info = document.createElement("div");
      info.className = "info";
      var t = document.createElement("div"); t.className = "t";
      t.textContent = (m.title_my || m.title) + (m.year ? " (" + m.year + ")" : "");
      var meta = document.createElement("div"); meta.className = "meta";
      if (m.rating) {
        var r = document.createElement("span"); r.className = "rate";
        r.textContent = "⭐ " + m.rating + "/10  ";
        meta.appendChild(r);
      }
      meta.appendChild(document.createTextNode(GENRES[m.genre] || m.genre));
      var g = document.createElement("span"); g.className = "g"; g.textContent = m.tab === "world" ? "🌍 နိုင်ငံတကာ" : (m.tab === "series" ? "📺 ဇာတ်လမ်းတွဲ" : "🇲🇲 မြန်မာ");
      meta.appendChild(g);
      var d = document.createElement("div"); d.className = "d"; d.textContent = m.desc || "";
      info.appendChild(t); info.appendChild(meta); info.appendChild(d);
      card.appendChild(img); card.appendChild(info);
      card.onclick = function(){ openModal(m); };
      return card;
  }

  function openModal(m){
    var player = document.getElementById("player");
    player.innerHTML = "";
    if (m.source === "archive" && m.file) {
      // Direct native playback — no YouTube, no iframe branding at all.
      var v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.style.width = "100%";
      var s = document.createElement("source");
      s.src = m.file;
      s.type = "video/mp4";
      v.appendChild(s);
      player.appendChild(v);
    } else {
      var f = document.createElement("iframe");
      f.src = embedUrl(m);
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      player.appendChild(f);
    }
    document.getElementById("mTitle").textContent = (m.title_my ? m.title_my + " / " : "") + m.title;
    document.getElementById("mMeta").textContent = (m.year || "") + (m.year ? " · " : "") + (GENRES[m.genre] || m.genre) + (m.rating ? " · ⭐ " + m.rating + "/10 IMDb" : "");
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
        state.genre = "all"; state.limit = PAGE;
        render();
      };
    });
    document.getElementById("search").addEventListener("input", function(e){
      state.q = e.target.value; state.limit = PAGE; render();
    });
    // Brand tap → back to main menu (home)
    document.querySelector(".brand").onclick = function(){
      state.tab = "myanmar"; state.genre = "all"; state.q = ""; state.limit = PAGE;
      document.getElementById("search").value = "";
      document.querySelectorAll(".tab").forEach(function(x){
        x.classList.toggle("active", x.getAttribute("data-tab") === "myanmar");
      });
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    document.getElementById("modalClose").onclick = closeModal;
    document.getElementById("modalBackdrop").onclick = closeModal;
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeModal(); });

    fetch("movies.json?v=4").then(function(r){ return r.json(); }).then(function(d){
      state.data = d.movies || [];
      render();
    }).catch(function(){
      document.getElementById("empty").hidden = false;
      document.getElementById("empty").textContent = "ဒေတာဖတ်မရပါ — နောက်မှထပ်ကြိုးစားပါ။";
    });
  });
})();
