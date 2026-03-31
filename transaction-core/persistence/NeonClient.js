import pg from "pg"

export class NeonClient {
  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async transaction(fn) {
    const client = await this.pool.connect()
    try {
      await client.query("BEGIN")
      const result = await fn(client)
      await client.query("COMMIT")
      return result
    } catch (e) {
      await client.query("ROLLBACK")
      throw e
    } finally {
      client.release()
    }
  }
}
