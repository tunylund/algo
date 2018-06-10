export default function interval(fn, duration = 0) {
  return setInterval(() => {
    requestAnimationFrame(fn)
  }, duration)
}