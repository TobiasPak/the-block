import type { Vehicle } from '../types/vehicle';

type TitleStatus = Vehicle['title_status'];

export const THEME = {
  titleStatusBadge: {
    clean:   'bg-status-clean/20 text-status-clean border border-status-clean/40',
    rebuilt: 'bg-status-rebuilt/20 text-status-rebuilt border border-status-rebuilt/40',
    salvage: 'bg-status-salvage/20 text-status-salvage border border-status-salvage/40',
  } satisfies Record<TitleStatus, string>,

  conditionColor: (grade: number): string => {
    if (grade >= 4.0) return 'text-condition-excellent';
    if (grade >= 3.0) return 'text-condition-good';
    if (grade >= 2.0) return 'text-condition-fair';
    return 'text-condition-poor';
  },

  conditionLabel: (grade: number): string => {
    if (grade >= 4.5) return 'Excellent';
    if (grade >= 3.5) return 'Good';
    if (grade >= 2.5) return 'Fair';
    return 'Poor';
  },
} as const;
