import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import type { DirectoryPageResult, SearchResultPayload } from '../context/EventContext';

const directoryCall = httpsCallable<{ search?: string; cursor?: string; pageSize?: number }, DirectoryPageResult>(
  getFunctions(app, 'asia-southeast1'), 'publicDirectory'
);
export async function publicDirectoryPage(options?: { lastDoc?: unknown; pageSize?: number }): Promise<DirectoryPageResult> {
  const cursor = typeof options?.lastDoc === 'string' ? options.lastDoc : undefined;
  return (await directoryCall({ cursor, pageSize: options?.pageSize || 20 })).data;
}
export async function publicDirectorySearch(search: string): Promise<SearchResultPayload> {
  return (await directoryCall({ search })).data;
}
