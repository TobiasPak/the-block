import { AlertTriangle } from 'lucide-react';
import type { Vehicle } from '../../types/vehicle';
import { STRINGS } from '../../config/strings';
import { THEME } from '../../config/theme';

function conditionBgColor(grade: number): string {
  if (grade >= 4.0) return 'bg-condition-excellent';
  if (grade >= 3.0) return 'bg-condition-good';
  if (grade >= 2.0) return 'bg-condition-fair';
  return 'bg-condition-poor';
}

interface DrawerConditionSectionProps {
  vehicle: Vehicle;
}

export function DrawerConditionSection({ vehicle }: DrawerConditionSectionProps) {
  const { condition_grade, condition_report, damage_notes } = vehicle;
  const filledCount = Math.floor(condition_grade);
  const colorText = THEME.conditionColor(condition_grade);
  const colorBg = conditionBgColor(condition_grade);

  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {STRINGS.drawer.condition}
      </p>

      {/* Grade banner */}
      <div className="bg-bg-elevated rounded-lg px-4 py-3 flex items-center gap-4 mb-3">
        <span className={`text-2xl font-bold tabular-nums ${colorText}`}>
          {condition_grade.toFixed(1)}
          <span className="text-sm font-normal text-text-muted"> / 5.0</span>
        </span>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1 mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${i < filledCount ? colorBg : 'bg-bg-subtle'}`}
              />
            ))}
          </div>
          <p className={`text-xs font-medium ${colorText}`}>
            {THEME.conditionLabel(condition_grade)}
          </p>
        </div>
      </div>

      {/* Condition report */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">{condition_report}</p>

      {/* Damage notes */}
      {damage_notes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            {STRINGS.drawer.damageNotes}
          </p>
          <ul className="space-y-1.5">
            {damage_notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <AlertTriangle
                  size={12}
                  className="text-status-rebuilt mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm text-text-secondary">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
