class Mutex {
  constructor() {
    this.resolveCurrent = null;
    this.current = null;
  }

  async acquire() {
    while (this.current) {
      await this.current;
    }
    this.current = new Promise((resolve) => {
      this.resolveCurrent = resolve;
    });
  }

  release() {
    this.current = null;
    if (this.resolveCurrent) {
      this.resolveCurrent();
    }
    this.resolveCurrent = null;
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
