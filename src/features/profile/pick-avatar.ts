import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { AVATAR_MIME_TYPES, MAX_AVATAR_BYTES } from './repository';

export async function pickAvatar(): Promise<FormData | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: AVATAR_MIME_TYPES, multiple: false, base64: false, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const size = Platform.OS === 'web' ? asset.file?.size : new File(asset.uri).size;
  if (!size) throw new Error('Could not decode image');
  if (size > MAX_AVATAR_BYTES) throw new Error('Avatar image is too large (max 1 MB).');
  const type = asset.mimeType || (asset.name.toLowerCase().endsWith('.png') ? 'image/png' : /\.jpe?g$/i.test(asset.name) ? 'image/jpeg' : asset.name.toLowerCase().endsWith('.webp') ? 'image/webp' : '');
  if (!AVATAR_MIME_TYPES.includes(type)) throw new Error('Avatar must be a PNG, JPEG or WebP image.');
  const form = new FormData();
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('Could not decode image');
    form.append('file', asset.file, asset.name);
  } else {
    // React Native FormData accepts URI parts; browsers require a File/Blob.
    form.append('file', { uri: asset.uri, name: asset.name, type } as unknown as Blob);
  }
  return form;
}
