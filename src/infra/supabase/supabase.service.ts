import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client!: SupabaseClient;
  private _anonClient!: SupabaseClient;

  /** Service-role client — for admin/DB operations, bypasses RLS */
  get client(): SupabaseClient {
    return this._client;
  }

  /** Anon client — required for client-side auth flows (signInWithOtp, verifyOtp) */
  get anonClient(): SupabaseClient {
    return this._anonClient;
  }

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    this.logger.log(`SUPABASE_URL: ${url ?? 'UNDEFINED'}`);
    this.logger.log(`SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? 'set' : 'UNDEFINED'}`);
    this.logger.log(`SUPABASE_ANON_KEY: ${anonKey ? 'set' : 'UNDEFINED'}`);

    this._client = createClient(url!, serviceKey!);
    this._anonClient = createClient(url!, anonKey!, {
      auth: {
        flowType: 'implicit',
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}
