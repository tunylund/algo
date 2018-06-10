import interval from './interval.mjs'

export default function (entities, looptime = 60) {
  const start = Date.now()
  let lastFrameTime = start
  return interval (() => {
    const frameTime = Date.now()
    const gameTime = frameTime - start
    const timeSinceLastFrame = frameTime - lastFrameTime
    lastFrameTime = frameTime
    entities.map(x => x(timeSinceLastFrame, gameTime))
  }, looptime)
}