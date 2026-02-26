'use client';

import { useEffect } from 'react';
import { requestPersistentStorage } from '@/lib/storage';
import { initDbSyncHooks } from '@/lib/db-hooks';

// Initialize Dexie sync hooks immediately (before any DB operations)
initDbSyncHooks();

export default function StorageInit() {
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  return null;
}
