import { profile } from "../data/profile.js";
import { skills } from "../data/skills.js";
import { projects } from "../data/projects.js";
import { topics, exercises } from "../data/exercises.js";
import { journey } from "../data/journey.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const url = (u) => (/^https?:\/\//.test(u || "") ? esc(u) : "#");
const ext = 'target="_blank" rel="noopener noreferrer"';
const empty = (t) => `<p class="empty">${t}</p>`;
const link = (u, t) => (u ? `<a href="${url(u)}" ${ext}>${t}</a>` : "");
const chips = (a) => (a?.length ? `<ul class="chips">${a.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "");

// Skills
$("#skills-body").innerHTML = skills.map((g) => `<div><h3>${esc(g.group)}</h3>${g.items.length ? `<ul class="chips">${g.items.map((i) => `<li>${i.link ? `<a href="${url(i.link)}" ${ext}>${esc(i.name)}</a>` : esc(i.name)}<small>${esc(i.status)}</small></li>`).join("")}</ul>` : `<p class="muted">Nothing listed yet.</p>`}</div>`).join("");

// Projects
$("#projects-body").innerHTML = projects.length
  ? projects.map((p) => `<article><h3>${esc(p.name)}</h3><p class="muted">${esc(p.status)}</p><p>${esc(p.description)}</p>${p.problem ? `<p>Problem: ${esc(p.problem)}</p>` : ""}${p.features?.length ? `<ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}${chips(p.tech)}<p class="links">${link(p.repo, "Repository")}${link(p.demo, "Live demo")}</p></article>`).join("")
  : empty("No finished projects yet, and none invented. Work in progress is in the coding lab and on GitHub below.");

// Coding lab: topic filter + search
let topic = "All", q = "";
const bar = $("#lab-filters");
bar.innerHTML = ["All", ...topics].map((t) => `<button type="button" aria-pressed="${t === "All"}">${esc(t)}</button>`).join("");
const drawLab = () => {
  const hit = exercises.filter((e) => (topic === "All" || e.topic === topic) && [e.title, e.summary, ...(e.concepts || [])].join(" ").toLowerCase().includes(q));
  $("#lab-body").innerHTML = !exercises.length ? empty("Exercises will be listed here as they are completed.")
    : hit.length ? hit.map((e) => `<details><summary><b>${esc(e.title)}</b> <span class="muted">${esc(e.topic)}</span></summary><p>${esc(e.summary)}</p>${e.approach ? `<p>Approach: ${esc(e.approach)}</p>` : ""}${e.learned ? `<p>Learned: ${esc(e.learned)}</p>` : ""}${chips(e.concepts)}<p class="links">${link(e.link, "View code")}</p></details>`).join("")
    : empty("No exercises match. Try another topic or search term.");
};
bar.addEventListener("click", (ev) => {
  const b = ev.target.closest("button"); if (!b) return;
  topic = b.textContent; bar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawLab();
});
$("#lab-search").addEventListener("input", (ev) => { q = ev.target.value.trim().toLowerCase(); drawLab(); });
drawLab();

// Journey, interests, contact
$("#journey-body").innerHTML = journey.length ? `<ol class="timeline">${journey.map((m) => `<li><span class="muted">${esc(m.date)}</span><h3>${esc(m.title)}</h3><p>${esc(m.note)}</p></li>`).join("")}</ol>` : empty("Milestones will be added as they happen.");
$("#beyond-body").innerHTML = profile.interests.map((i) => `<li><b>${esc(i.title)}</b> <span class="muted">${esc(i.note)}</span></li>`).join("");
const s = profile.social;
$("#contact-body").innerHTML = [["GitHub", s.github, s.github], ["LinkedIn", s.linkedin, s.linkedin], ["Email", s.email && `mailto:${s.email}`, s.email]]
  .map(([n, h, t]) => (h ? `<a class="repo" href="${n === "Email" ? esc(h) : url(h)}" ${n === "Email" ? "" : ext}><span class="muted">${n}</span><br>${esc(String(t).replace(/^https?:\/\//, ""))}</a>` : `<p class="muted">${n}<br>To be added</p>`)).join("");

// GitHub repositories: cached 10 min, stale cache on failure, forks and this site excluded
const KEY = "gh-repos-v1", TTL = 6e5, gh = $("#github-body");
async function loadRepos() {
  let c = null;
  try { c = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (c && Date.now() - c.t < TTL) return c.d;
  try {
    const r = await fetch(`https://api.github.com/users/${profile.github}/repos?per_page=100&sort=pushed`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(r.status);
    const d = (await r.json()).filter((x) => !x.fork && x.name !== `${profile.github}.github.io`)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6)
      .map((x) => ({ name: x.name, desc: x.description, lang: x.language, stars: x.stargazers_count, at: x.pushed_at, url: x.html_url }));
    try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch {}
    return d;
  } catch (e) { if (c) return c.d; throw e; }
}
loadRepos()
  .then((d) => { gh.innerHTML = d.length ? d.map((r) => `<a class="repo" href="${url(r.url)}" ${ext}><h3>${esc(r.name)}</h3><p class="muted">${esc(r.desc || "No description yet.")}</p><p class="muted">${r.lang ? esc(r.lang) + ", " : ""}${r.stars} stars, updated ${new Date(r.at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p></a>`).join("") : empty("No public repositories to show yet."); })
  .catch(() => { gh.innerHTML = empty(`GitHub's API could not be reached (it may be rate-limited). <a href="${url(s.github)}" ${ext}>Open the profile on GitHub</a>.`); });

// 3D hero: optional. If WebGL or the CDN fails, the CSS background stays.
const cv = $("#scene");
import("./scene.js").then((m) => m.initScene(cv)).catch(() => cv.classList.add("off"));
/* =====================================
   PREMIUM 3D PORTRAIT TILT
   ===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const card = document.querySelector(".portrait-card");

    if (!card) return;

    // Respect accessibility preferences
    if (window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches) return;

    // Disable tilt on touch devices
    if (!window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches) return;

    const maxTilt = 8;
    let animationFrame;

    card.addEventListener("pointermove", (e) => {

        const rect = card.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Calculate smooth rotation
        const rotateY = (x - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - y) * maxTilt * 2;

        cancelAnimationFrame(animationFrame);

        animationFrame = requestAnimationFrame(() => {

            card.style.setProperty(
                "--rotate-x",
                `${rotateX}deg`
            );

            card.style.setProperty(
                "--rotate-y",
                `${rotateY}deg`
            );

            card.style.setProperty("--lift", "-8px");
        });

    });

    // Reset smoothly
    const resetCard = () => {

        cancelAnimationFrame(animationFrame);

        card.style.setProperty("--rotate-x", "0deg");
        card.style.setProperty("--rotate-y", "0deg");
        card.style.setProperty("--lift", "0px");

    };

    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointercancel", resetCard);

});
