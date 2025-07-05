
'use client';

import type { AbuseReport } from '@/types';

const ABUSE_REPORTS_STORAGE_KEY = 'internshipHub_abuseReports';

function initializeReports(): void {
  if (typeof window !== "undefined") {
    if (localStorage.getItem(ABUSE_REPORTS_STORAGE_KEY) === null) {
      localStorage.setItem(ABUSE_REPORTS_STORAGE_KEY, JSON.stringify([]));
    }
  }
}

initializeReports();

export async function getAbuseReports(): Promise<AbuseReport[]> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined") {
      const reportsRaw = localStorage.getItem(ABUSE_REPORTS_STORAGE_KEY);
      const reports: AbuseReport[] = reportsRaw ? JSON.parse(reportsRaw) : [];
      resolve(reports);
    } else {
      resolve([]);
    }
  });
}

export async function reportAbuse(
  reportData: Omit<AbuseReport, 'id' | 'dateReported' | 'status'>
): Promise<AbuseReport> {
  return new Promise(async (resolve) => {
    const allReports = await getAbuseReports();
    const newReport: AbuseReport = {
      ...reportData,
      id: `issue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      dateReported: new Date().toISOString(),
      status: 'OPEN',
    };
    allReports.push(newReport);
    if (typeof window !== "undefined") {
      localStorage.setItem(ABUSE_REPORTS_STORAGE_KEY, JSON.stringify(allReports));
    }
    resolve(newReport);
  });
}

export async function updateReportStatus(
  reportId: string,
  status: AbuseReport['status']
): Promise<AbuseReport | null> {
    return new Promise(async (resolve) => {
        const allReports = await getAbuseReports();
        const reportIndex = allReports.findIndex(r => r.id === reportId);

        if (reportIndex > -1) {
            allReports[reportIndex].status = status;
            if (typeof window !== "undefined") {
                localStorage.setItem(ABUSE_REPORTS_STORAGE_KEY, JSON.stringify(allReports));
            }
            resolve(allReports[reportIndex]);
        } else {
            resolve(null);
        }
    });
}
