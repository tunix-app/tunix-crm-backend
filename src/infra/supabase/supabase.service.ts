import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client!: SupabaseClient;

  get client(): SupabaseClient {
    return this._client;
  }

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    this.logger.log(`SUPABASE_URL: ${url ?? 'UNDEFINED'}`);
    this.logger.log(`SUPABASE_SERVICE_ROLE_KEY: ${key ? 'set' : 'UNDEFINED'}`);

    this._client = createClient(url!, key!);
  }
}
