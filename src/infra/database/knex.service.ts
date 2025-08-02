import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import knex, { Knex } from 'knex';

@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy {
  private _db!: Knex;
  get db(): Knex {
    return this._db;
  }

  onModuleInit() {
    this._db = knex({
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL, // pooler URL
        ssl: { rejectUnauthorized: false }, // Supabase requires SSL
      },
      pool: { min: 2, max: 10 },
    });
  }

  async onModuleDestroy() {
    if (this._db) await this._db.destroy();
  }
}
