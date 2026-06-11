/** Guard síncrono anti doble-submit para checkout */
export function createSubmitLock() {
  let locked = false;
  return {
    tryAcquire(): boolean {
      if (locked) return false;
      locked = true;
      return true;
    },
    release(): void {
      locked = false;
    },
    isLocked(): boolean {
      return locked;
    },
  };
}
