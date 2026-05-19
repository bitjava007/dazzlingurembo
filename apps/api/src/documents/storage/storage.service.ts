import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: any;

  constructor(private readonly config: ConfigService) {}

  private getClient() {
    if (!this.client) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createClient } = require('@supabase/supabase-js');
        const url = this.config.get<string>('SUPABASE_URL');
        const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        if (url && key) this.client = createClient(url, key);
      } catch (e) {
        this.logger.warn('Supabase storage not available');
      }
    }
    return this.client;
  }

  async upload(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;
    const { data, error } = await client.storage.from(bucket).upload(path, buffer, { contentType, upsert: true });
    if (error) {
      this.logger.error('Upload failed', error);
      return null;
    }
    // data is used implicitly - suppress unused var lint
    void data;
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);
    return urlData?.publicUrl ?? null;
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    const { error } = await client.storage.from(bucket).remove([path]);
    return !error;
  }
}
