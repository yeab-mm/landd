import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

export type PickedFile = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
};

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

/** Read local or data URI into base64 data URL for API storage (same as marketplace listing). */
export async function fileRefToDataUrl(
  file: { uri: string; name?: string; type?: string; mimeType?: string } | null | undefined
): Promise<string | null> {
  if (!file?.uri) return null;
  if (file.uri.startsWith('data:')) return file.uri;

  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const mime = file.mimeType || file.type || mimeFromName(file.name || 'document');
  return `data:${mime};base64,${base64}`;
}

export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const file = result.assets[0];
  const maxSize = 10 * 1024 * 1024;
  if (file.size && file.size > maxSize) {
    Alert.alert('File too large', 'Maximum file size is 10MB.');
    return null;
  }
  return {
    name: file.name || 'Document',
    uri: file.uri,
    mimeType: file.mimeType || undefined,
    size: file.size,
  };
}

export async function buildDocumentsMap(
  entries: Array<{
    label: string;
    file: { uri: string; name?: string; type?: string; mimeType?: string } | null | undefined;
  }>
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const { label, file } of entries) {
    const dataUrl = await fileRefToDataUrl(file);
    if (dataUrl) out[label] = dataUrl;
  }
  return out;
}

export function missingRequiredDocs(
  required: string[],
  documents: Record<string, string>
): string[] {
  return required.filter((label) => {
    const v = documents[label];
    return typeof v !== 'string' || !v.trim();
  });
}
