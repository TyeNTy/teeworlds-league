class Mutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }

  async acquire() {
    return new Promise((resolve) => {
      // Add this acquirer to the queue in order
      this.queue.push(resolve);

      // Try to grant the lock if available
      this._tryGrant();
    });
  }

  _tryGrant() {
    if (!this.locked && this.queue.length > 0) {
      this.locked = true;
      const resolve = this.queue.shift();
      resolve();
    }
  }

  release() {
    this.locked = false;
    // Grant to the next waiter in queue
    this._tryGrant();
  }

  async runExclusive(callback) {
    await this.acquire();
    try {
      return await callback();
    } finally {
      this.release();
    }
  }
}


const mutexes = new Map();

const runExclusiveWithId = async (id, fn) => {
  if (!mutexes.has(id)) {
    mutexes.set(id, new Mutex());
  }
  return await mutexes.get(id).runExclusive(fn);
}

const freeMutexWithId = async (id) => {
  if (!mutexes.has(id)) {
    return;
  }

  return await runExclusiveWithId(id, async () => {
      mutexes.delete(id);
  });
}

module.exports = { Mutex, runExclusiveWithId, freeMutexWithId };
