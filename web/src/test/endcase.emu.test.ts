import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { acknowledgeDestination, advanceStatus, cancelCase, selectDestination } from '../lib/workflow'
import { answer, dispatchIt, offerToCrew, reportCase } from './scenario'
import { amb, disp, readCase, readOffers, resetWorld, startWorld, stopWorld } from './world'

beforeAll(startWorld)
afterAll(stopWorld)
beforeEach(resetWorld)

const here = () => ({ lat: 12.87, lng: 74.84, atMs: Date.now(), source: 'simulated' as const })

describe('ending a case without a hospital works from every state before pickup', () => {
  it('reported, dispatched, en route (no answers, accepted, selected, acknowledged) and on scene', async () => {
    const d = disp()
    const end = async (id: string, label: string) => {
      try { await cancelCase(d.db, d.actor, await readCase(d.db, id), 'false', 'matrix test', await readOffers(d.db, id)) } catch (e) { throw new Error(`${label}: ${(e as Error).message}`) }
      expect((await readCase(d.db, id)).status, label).toBe('closed')
    }
    await end(await reportCase('trauma'), 'reported')
    const b = await reportCase('trauma'); await offerToCrew(b); await end(b, 'dispatched')
    const c = await reportCase('trauma'); await dispatchIt(c); await end(c, 'enroute, hospitals asked')
    const e = await reportCase('trauma'); await dispatchIt(e); await answer(e, 'h2', true); await end(e, 'enroute, one accepted')
    const f = await reportCase('trauma'); await dispatchIt(f); await answer(f, 'h2', true)
    await selectDestination(d.db, d.actor, await readCase(d.db, f), await readOffers(d.db, f), 'h2', null, 'h2'); await end(f, 'enroute, destination selected')
    const g = await reportCase('trauma'); await dispatchIt(g); await answer(g, 'h2', true)
    await selectDestination(d.db, d.actor, await readCase(d.db, g), await readOffers(d.db, g), 'h2', null, 'h2')
    const a = amb(); await advanceStatus(a.db, a.actor, await readCase(a.db, g), here()); await acknowledgeDestination(a.db, a.actor, await readCase(a.db, g))
    await end(g, 'on scene, destination acknowledged')
    expect(true).toBe(true)
  })
})
