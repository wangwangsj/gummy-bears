// Screen-space input is independent of the camera and the soft-body simulation.
export function fullPull(width, height) {
  return Math.max(64, Math.min(112, Math.min(width, height) * 0.25));
}
export function aimCommand(aim, width, height, speed) {
  const x = aim.sx - aim.nx, y = aim.ny - aim.sy;
  const length = Math.hypot(x, y), k = Math.min(1, length / fullPull(width, height));
  if (length < 1e-3) return { vx: 0, vy: 0, k: 0 };
  return { vx: x / length * k * speed, vy: y / length * k * speed, k };
}
export function releaseAim(aim, event, cancel, width, height, speed) {
  if (!aim || event.pointerId !== aim.id || cancel) return null;
  const final = { ...aim };
  if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    final.nx = event.clientX; final.ny = event.clientY;
  }
  const command = aimCommand(final, width, height, speed);
  return command.k >= 0.08 ? command : null;
}
