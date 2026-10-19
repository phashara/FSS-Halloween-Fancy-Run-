import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import type { DirectoryPageResult, SearchResultPayload } from '../context/EventContext';

const directoryCall = httpsCallable<{ search?: string; cursor?: string; pageSize?: number }, DirectoryPageResult>(
  getFunctions(app, 'asia-southeast1'),
  'publicDirectory'
);

export async function publicDirectoryPage(options?: { lastDoc?: unknown; pageSize?: number }): Promise<DirectoryPageResult> {
  const cursor = typeof options?.lastDoc === 'string' && options.lastDoc.length <= 160 ? options.lastDoc : undefined;
  // Cloud Function strictly restricts pageSize to 1..20
  const safePageSize = Math.min(Math.max(Number(options?.pageSize) || 20, 1), 20);

  try {
    const res = await directoryCall({ cursor, pageSize: safePageSize });
    return res.data || { runners: [], cards: [], orders: [], hasMore: false, lastDoc: null };
  } catch (err: any) {
    console.warn('Public directory page fetch notice:', err?.message || err);
    throw new Error(err?.message || 'ไม่สามารถโหลดข้อมูลรายชื่อจาก Cloud ได้ในขณะนี้');
  }
}

export async function publicDirectorySearch(search: string): Promise<SearchResultPayload> {
  const trimmed = (search || '').trim();
  // Cloud Function rejects 1-character search strings to protect quota
  if (!trimmed || trimmed.length < 2) {
    return { runners: [], cards: [], orders: [] };
  }

  try {
    const res = await directoryCall({ search: trimmed });
    return res.data || { runners: [], cards: [], orders: [] };
  } catch (err: any) {
    console.warn('Public directory search notice:', err?.message || err);
    throw new Error(err?.message || 'ไม่สามารถค้นหารายชื่อจาก Cloud ได้ในขณะนี้');
  }
}
