import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Station } from "@/data/types";
import type { Effect } from "@/config/scenes";
import { activeStore, stage } from "./store";
import { ar, eraOf } from "./stations";
import { geo } from "@/data/geo";

type V = { x: number; y: number; flip: boolean };
const pinCfg = (trigger: Element, len: string | (() => string), extra: ScrollTrigger.Vars = {}): ScrollTrigger.Vars => ({
  trigger, start: "top top", end: len, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, ...extra,
});

/** Shared: marks this station active and sets the era for the 3D stage + UI. */
export function mountActive(sec: HTMLElement, s: Station) {
  ScrollTrigger.create({
    trigger: sec, start: "top 55%", end: "bottom 55%",
    onToggle: (self) => { if (self.isActive) { activeStore.set(s.id); stage.era = eraOf(s.category); } },
  });
}

/** Ten distinct scroll choreographies. Each one animates a different part of the same scene markup. */
export function mountEffect(sec: HTMLElement, s: Station, effect: Effect, v: V) {
  const q = gsap.utils.selector(sec);
  const one = (sel: string) => q(sel)[0] as HTMLElement;
  const scrub = (trigger: Element | string, start: string, end: string) => ({ trigger, start, end, scrub: true });

  switch (effect) {
    case "iris": { // light blooms from a point behind the pinned title
      const o = `${v.x}% ${v.y}%`;
      gsap.timeline({ scrollTrigger: pinCfg(one("[data-pin]"), "+=110%") })
        .fromTo(one("[data-iris]"), { clipPath: `circle(0% at ${o})` }, { clipPath: `circle(150% at ${o})`, ease: "none", duration: 1 }, 0)
        .fromTo(one("[data-title]"), { opacity: 0.2, yPercent: 10 }, { opacity: 1, yPercent: 0, ease: "power1.out", duration: 0.5 }, 0);
      break;
    }
    case "parallax": { // dune layers drift at different depths
      q("[data-layer]").forEach((el, i) =>
        gsap.fromTo(el, { yPercent: -8 * (i + 1) }, { yPercent: 12 * (i + 1), ease: "none", scrollTrigger: scrub(one("[data-a]"), "top bottom", "bottom top") }));
      gsap.fromTo(one("[data-title]"), { yPercent: 35 }, { yPercent: -15, ease: "none", scrollTrigger: scrub(one("[data-a]"), "top bottom", "bottom top") });
      break;
    }
    case "quote": { // pinned quote lights up word by word
      gsap.timeline({ scrollTrigger: pinCfg(one("[data-pin]"), "+=140%") })
        .fromTo(q("[data-w]"), { opacity: 0.12 }, { opacity: 1, stagger: 0.06, ease: "none" });
      break;
    }
    case "figures": { // pinned horizontal pan (positive x = reveal toward the left in RTL)
      const wrap = one("[data-pin]"), track = one("[data-track]");
      const dist = () => Math.max(track.scrollWidth - wrap.clientWidth + 64, 0);
      gsap.timeline({ scrollTrigger: pinCfg(wrap, () => `+=${Math.max(dist(), window.innerHeight * 0.7)}`) })
        .fromTo(track, { x: 0 }, { x: () => dist(), ease: "none" })
        .fromTo(q("[data-fig]"), { scale: 0.92, opacity: 0.5 }, { scale: 1, opacity: 1, stagger: 0.1, ease: "none" }, 0);
      break;
    }
    case "route": { // the 3D map takes over; pinning drives the route line
      const pts = geo[s.id] ?? [];
      const wps = q("[data-wp]");
      ScrollTrigger.create({
        trigger: sec, start: "top 80%", end: "bottom 20%",
        onToggle: (self) => {
          if (self.isActive) { stage.mode = "map"; stage.route.pts = pts.map((p) => p.p); stage.route.id = s.id; stage.route.progress = 0; }
          else if (stage.route.id === s.id) { stage.mode = "field"; stage.route.id = 0; }
        },
      });
      ScrollTrigger.create({
        ...pinCfg(one("[data-pin]"), "+=170%", { scrub: true }),
        onUpdate: (self) => {
          stage.route.progress = self.progress;
          wps.forEach((el, i) => el.toggleAttribute("data-on", self.progress >= i / Math.max(wps.length - 1, 1) - 0.001));
        },
      });
      break;
    }
    case "curtain": { // two panels part to reveal the station
      gsap.timeline({ scrollTrigger: pinCfg(one("[data-pin]"), "+=100%") })
        .to(one("[data-cl]"), { xPercent: -102, ease: "power2.inOut" }, 0)
        .to(one("[data-cr]"), { xPercent: 102, ease: "power2.inOut" }, 0)
        .fromTo(one("[data-title]"), { scale: 1.12, opacity: 0.4 }, { scale: 1, opacity: 1, ease: "none" }, 0);
      break;
    }
    case "zoom": { // dolly into the title until it dissolves
      gsap.timeline({ scrollTrigger: pinCfg(one("[data-pin]"), "+=130%") })
        .fromTo(one("[data-title]"), { scale: 0.85, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.3, ease: "power1.out" })
        .to(one("[data-title]"), { scale: 7, opacity: 0, filter: "blur(14px)", duration: 0.7, ease: "power2.in" })
        .fromTo(one("[data-flash]"), { opacity: 0 }, { opacity: 0.5, duration: 0.35, yoyo: true, repeat: 1, ease: "none" }, 0.45);
      break;
    }
    case "ink": { // the excerpt is written line by line (right → left)
      q("[data-ink]").forEach((el) =>
        gsap.fromTo(el, { clipPath: "inset(0 0 0 100%)", opacity: 0.35 }, { clipPath: "inset(0 0 0 0%)", opacity: 1, ease: "none", scrollTrigger: scrub(el, "top 90%", "top 55%") }));
      break;
    }
    case "stack": { // sticky cards settle into a deck
      const cards = q("[data-card]");
      cards.slice(0, -1).forEach((c, i) =>
        gsap.to(c, { scale: 0.93, opacity: 0.55, ease: "none", scrollTrigger: scrub(cards[i + 1], "top 75%", "top 25%") }));
      break;
    }
    case "wash": { // the era's color floods in while the years count up
      const from = 571, to = parseInt(s.year.match(/\d+/)?.[0] ?? "571", 10);
      const out = one("[data-count]"), o = { v: from };
      out.textContent = ar(from);
      gsap.timeline({ scrollTrigger: pinCfg(one("[data-pin]"), "+=120%") })
        .fromTo(one("[data-wash]"), { opacity: 0 }, { opacity: 1, ease: "none", duration: 1 }, 0)
        .to(o, { v: to, ease: "none", duration: 1, onUpdate: () => { out.textContent = ar(Math.round(o.v)); } }, 0)
        .fromTo(one("[data-title]"), { yPercent: 14, opacity: 0.3 }, { yPercent: 0, opacity: 1, ease: "none", duration: 0.6 }, 0.2);
      break;
    }
  }
}
