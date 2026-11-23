// Beep [start, end] times in seconds, measured from audio.mp3
const BEEPS = [[0.00,0.08],[0.14,0.34],[0.40,0.48],[0.91,0.98],[1.04,1.25],[1.68,1.76],[1.82,2.02],[2.08,2.29],[2.35,2.42],[2.86,3.06],[3.50,3.70],[3.76,3.97],[4.03,4.24],[4.67,4.74],[4.80,5.01],[5.07,5.14]];

const a = document.getElementById("a");
const btn = document.getElementById("play");
const light = document.getElementById("light");

let playing = false;
let last = 0;
let raf;

function tick() {
  const t = a.currentTime;
  light.classList.toggle("on", BEEPS.some(([s, e]) => t >= s && t < e));
  raf = requestAnimationFrame(tick);
}

btn.addEventListener("click", async () => {
  if (playing) return;
  playing = true;
  btn.disabled = true;
  last = 0;
  a.currentTime = 0;
  try {
    await a.play();
  } catch (e) {
    playing = false;
    btn.disabled = false;
    return;
  }
  tick();
});

// No pausing: resume if anything pauses it before the end
a.addEventListener("pause", () => {
  if (playing && !a.ended) a.play();
});

// No seeking: revert to last position
a.addEventListener("timeupdate", () => { if (!a.seeking) last = a.currentTime; });
a.addEventListener("seeking", () => {
  if (playing && Math.abs(a.currentTime - last) > 0.5) a.currentTime = last;
});

a.addEventListener("ended", () => {
  playing = false;
  cancelAnimationFrame(raf);
  light.classList.remove("on");
  btn.textContent = "Play again";
  btn.disabled = false;
});

a.addEventListener("contextmenu", e => e.preventDefault());

if ("mediaSession" in navigator) {
  ["play", "pause", "seekbackward", "seekforward", "seekto", "previoustrack", "nexttrack", "stop"]
    .forEach(act => { try { navigator.mediaSession.setActionHandler(act, () => {}); } catch (e) {} });
}
