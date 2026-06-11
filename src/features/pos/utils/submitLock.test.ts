import { describe, it, expect } from 'vitest';
import { createSubmitLock } from './submitLock';

describe('createSubmitLock', () => {
  it('blocks second acquire until release (anti double-click)', () => {
    const lock = createSubmitLock();
    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);
    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });
});
