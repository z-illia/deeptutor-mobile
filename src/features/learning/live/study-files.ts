import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import type { OutgoingAttachment } from '@/features/chat/live/protocol';
export type AttachmentPolicy = { effective: { max_file_bytes: number; max_total_bytes: number } };
export async function pickStudyFiles(policy: AttachmentPolicy, existing: OutgoingAttachment[]): Promise<OutgoingAttachment[]> {
  const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true, base64: true, type: ['text/*', 'application/pdf', 'image/*'] });
  if (result.canceled) return [];
  // Mobile deliberately caps memory use below a potentially much larger server allowance.
  const perFile = Math.min(policy.effective.max_file_bytes, 4 * 1024 * 1024);
  const totalLimit = Math.min(policy.effective.max_total_bytes, 8 * 1024 * 1024);
  let total = existing.reduce((sum, file) => sum + Math.ceil((file.base64?.length ?? 0) * 3 / 4), 0);
  const files: OutgoingAttachment[] = [];
  for (const asset of result.assets) {
    const size = asset.size ?? (Platform.OS !== 'web' ? new File(asset.uri).size : asset.file?.size);
    if (size === undefined || size > perFile || total + size > totalLimit) throw new Error('Files exceed the mobile or server attachment limit (up to 4 MB each, 8 MB total).');
    total += size;
    const encoded = Platform.OS === 'web' ? asset.base64 ?? asset.uri : await new File(asset.uri).base64();
    const base64 = encoded.replace(/^data:[^,]*,/, '');
    if (!base64 || base64.startsWith('blob:')) throw new Error('The selected file could not be read.');
    files.push({ type: asset.mimeType?.startsWith('image/') ? 'image' : 'file', filename: asset.name, mime_type: asset.mimeType ?? 'application/octet-stream', base64 });
  }
  return files;
}
