import game from '../src/game.mjs'
import timeout from '../scr/timeout.mjs'
import * as td from 'testdouble'

describe('game', () => {
  it('should run the game loop', () => {
    const entity = td.function()
    game([entity], 0)
    return timeout(td.verify(entity()))
  })
})
