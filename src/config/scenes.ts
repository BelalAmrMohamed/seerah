export type Effect =
  | "iris" | "parallax" | "quote" | "figures" | "route" | "curtain"
  | "zoom" | "ink" | "stack" | "wash"
  | "door" | "rotate" | "horizon" | "split" | "morph" | "constellation";

export const sceneEffect: Record<number, Effect> = {
  1: "iris",       2: "parallax",     3: "quote",        4: "route",
  5: "stack",      6: "wash",         7: "door",         8: "iris",
  9: "figures",    10: "zoom",        11: "route",       12: "ink",
  13: "horizon",   14: "quote",       15: "route",       16: "figures",
  17: "route",     18: "wash",        19: "door",        20: "rotate",
  21: "parallax",  22: "split",       23: "stack",       24: "route",
  25: "morph",     26: "constellation",27: "route",      28: "figures",
  29: "quote",     30: "wash",
};

// Per-station variation: iris origin (x% y%), curtain tilt, etc.
export const variant = (id: number) => ({
  x: [50, 20, 80, 35, 65][id % 5],
  y: [30, 70, 20, 60, 45][(id * 3) % 5],
  flip: id % 2 === 0,
});
