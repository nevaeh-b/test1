import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';


@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async uploadTravelerVerification(
    userId: number,
    file: Express.Multer.File,
  ) {
    const extension = file.originalname.split('.').pop();
    const fileName = `${userId}/${randomUUID()}.${extension}`;

    const { error } = await this.client.storage
      .from('traveler-verification')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return fileName;
  }

  async downloadTravelerVerification(filePath: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from('traveler-verification')
      .download(filePath);

    if (error) {
      throw new Error(`증빙 파일 다운로드 실패: ${error.message}`);
    }

    if (!data) {
      throw new Error('증빙 파일을 찾을 수 없습니다.');
    }

    return Buffer.from(await data.arrayBuffer());
  }

  async uploadStayVerification(userId: number, file: Express.Multer.File) {
    const extension = file.originalname.split('.').pop();
    const fileName = `${userId}/${randomUUID()}.${extension}`;

    const { error } = await this.client.storage
      .from('stay-verification')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return fileName;
  }

  async downloadStayVerification(filePath: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from('stay-verification')
      .download(filePath);

    if (error) {
      throw new Error(`증빙 파일 다운로드 실패: ${error.message}`);
    }

    if (!data) {
      throw new Error('증빙 파일을 찾을 수 없습니다.');
    }

    return Buffer.from(await data.arrayBuffer());
  }

    async uploadProfileImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const extension = file.originalname.split('.').pop();
    const fileName = `${userId}/${randomUUID()}.${extension}`;

    const { error } = await this.client.storage
      .from('profile-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.client.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
    async removeProfileImage(filePath: string) {
    const { error } = await this.client.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      throw new Error(error.message);
    }
  }
}