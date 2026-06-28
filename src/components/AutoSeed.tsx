'use client';

import { useEffect } from 'react';
import { hasAnyKpiData, seedImportedData } from '@/lib/seedDataImport';

/**
 * Auto-seeds KPI data on first visit (when localStorage is empty).
 * Renders nothing — side-effect only.
 */
export default function AutoSeed() {
  useEffect(() => {
    if (!hasAnyKpiData()) {
      seedImportedData();
    }
  }, []);

  return null;
}
