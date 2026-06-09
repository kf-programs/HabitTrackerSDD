import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function encodeUrlPayload(value: unknown) {
  return compressToEncodedURIComponent(JSON.stringify(value));
}

export function decodeUrlPayload<T>(encoded: string) {
  const decoded = decompressFromEncodedURIComponent(encoded);
  if (!decoded) {
    throw new Error('Unable to decode payload');
  }
  return JSON.parse(decoded) as T;
}
