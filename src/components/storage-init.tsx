'use client';

import { useEffect } from 'react';
import { requestPersistentStorage } from '@/lib/storage';

export default function StorageInit() {
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  return null;
}
