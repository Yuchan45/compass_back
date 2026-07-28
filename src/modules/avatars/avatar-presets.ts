export type AvatarPresetStyle = 'thumbs' | 'shapes' | 'disco' | 'pixel-art-neutral';

export type AvatarPreset = {
  id: string;
  publicId: string;
  seed: string;
  style: AvatarPresetStyle;
};

const presetStyles: AvatarPresetStyle[] = [
  ...Array<AvatarPresetStyle>(8).fill('thumbs'),
  ...Array<AvatarPresetStyle>(8).fill('shapes'),
  ...Array<AvatarPresetStyle>(7).fill('disco'),
  ...Array<AvatarPresetStyle>(7).fill('pixel-art-neutral'),
];

export const avatarPresets: AvatarPreset[] = presetStyles.map((style, index) => {
  const number = String(index + 1).padStart(2, '0');

  return {
    id: `default-avatar-${number}`,
    publicId: `default-avatar-${number}`,
    seed: `compass-default-avatar-${number}`,
    style,
  };
});

export const avatarPresetIds = avatarPresets.map((preset) => preset.id);
