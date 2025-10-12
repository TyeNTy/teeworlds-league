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

module.exports = { Mutex };
