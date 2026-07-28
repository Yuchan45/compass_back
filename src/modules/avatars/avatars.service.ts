import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type * as DiceBearCore from '@dicebear/core';
import type { StyleDefinition } from '@dicebear/core';
import { v2 as cloudinary } from 'cloudinary';
import { avatarPresets, type AvatarPreset, type AvatarPresetStyle } from './avatar-presets';

type AvatarPresetResponse = {
  id: string;
  style: AvatarPresetStyle;
  url: string;
};

// Keeps ESM-only DiceBear packages loadable from the current CommonJS Nest build.
// eslint-disable-next-line @typescript-eslint/no-implied-eval
const nativeImport = new Function('specifier', 'options', 'return import(specifier, options)') as <
  T,
>(
  specifier: string,
  options?: unknown,
) => Promise<T>;

@Injectable()
export class AvatarsService {
  private readonly cloudinaryApiKey?: string;
  private readonly cloudinaryApiSecret?: string;
  private readonly avatarFolder: string;
  private readonly cloudinaryCloudName?: string;

  constructor(config: ConfigService) {
    this.avatarFolder = config.get<string>('cloudinary.avatarFolder', 'compass/avatars/defaults');
    this.cloudinaryCloudName = config.get<string>('cloudinary.cloudName')?.trim() || undefined;

    this.cloudinaryApiKey = config.get<string>('cloudinary.apiKey')?.trim() || undefined;
    this.cloudinaryApiSecret = config.get<string>('cloudinary.apiSecret')?.trim() || undefined;

    if (this.cloudinaryCloudName && this.cloudinaryApiKey && this.cloudinaryApiSecret) {
      cloudinary.config({
        api_key: this.cloudinaryApiKey,
        api_secret: this.cloudinaryApiSecret,
        cloud_name: this.cloudinaryCloudName,
        secure: true,
      });
    }
  }

  findPresets() {
    this.assertCloudinaryConfigured();

    return {
      data: avatarPresets.map((preset) => this.toPresetResponse(preset)),
    };
  }

  getPresetUrl(presetId: string) {
    this.assertCloudinaryConfigured();

    const preset = avatarPresets.find((candidate) => candidate.id === presetId);

    if (!preset) {
      throw new BadRequestException('Invalid avatar preset.');
    }

    return this.toPresetResponse(preset).url;
  }

  async generatePresetSvg(preset: AvatarPreset) {
    const [{ Avatar, Style }, definition] = await Promise.all([
      nativeImport<typeof DiceBearCore>('@dicebear/core'),
      this.importStyleDefinition(preset.style),
    ]);
    const style = new Style(definition.default);
    const avatar = new Avatar(style, {
      seed: preset.seed,
    });

    return avatar.toString();
  }

  async syncPresets() {
    this.assertCloudinaryUploadConfigured();

    const results = [];

    for (const preset of avatarPresets) {
      const svg = await this.generatePresetSvg(preset);
      await cloudinary.uploader.upload(
        `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`,
        {
          folder: this.avatarFolder,
          overwrite: true,
          public_id: preset.publicId,
          resource_type: 'image',
        },
      );

      results.push({
        id: preset.id,
        style: preset.style,
        url: this.toPresetResponse(preset).url,
      });
    }

    return {
      data: results,
    };
  }

  private toPresetResponse(preset: AvatarPreset): AvatarPresetResponse {
    return {
      id: preset.id,
      style: preset.style,
      url: cloudinary.url(`${this.avatarFolder}/${preset.publicId}`, {
        cloud_name: this.cloudinaryCloudName,
        crop: 'fill',
        fetch_format: 'auto',
        height: 1024,
        quality: 'auto:best',
        resource_type: 'image',
        secure: true,
        transformation: [{ dpr: 'auto' }],
        width: 1024,
      }),
    };
  }

  private assertCloudinaryConfigured() {
    if (!this.cloudinaryCloudName) {
      throw new ServiceUnavailableException('Cloudinary avatar storage is not configured.');
    }
  }

  private assertCloudinaryUploadConfigured() {
    this.assertCloudinaryConfigured();

    if (!this.cloudinaryApiKey || !this.cloudinaryApiSecret) {
      throw new ServiceUnavailableException('Cloudinary upload credentials are not configured.');
    }
  }

  private importStyleDefinition(style: AvatarPresetStyle) {
    switch (style) {
      case 'thumbs':
        return this.importJsonStyle('@dicebear/styles/thumbs.json');
      case 'shapes':
        return this.importJsonStyle('@dicebear/styles/shapes.json');
      case 'disco':
        return this.importJsonStyle('@dicebear/styles/disco.json');
      case 'pixel-art-neutral':
        return this.importJsonStyle('@dicebear/styles/pixel-art-neutral.json');
    }
  }

  private importJsonStyle(specifier: string) {
    return nativeImport<{ default: StyleDefinition }>(specifier, {
      with: {
        type: 'json',
      },
    });
  }
}
