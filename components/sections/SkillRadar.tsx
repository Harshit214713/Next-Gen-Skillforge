'use client';

import {
  Radar,
  RadarChart,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface RadarPanelProps {
  title: string;
  subtitle: string;
  data: { skill: string; value: number; fullMark: number }[];
  color: string;
}

export function SkillRadar({ title, subtitle, data, color }: RadarPanelProps) {
  const chartData = data.filter((d) => d.value > 0);

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading font-bold text-lg">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center rounded-lg border border-dashed border-background p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No skill data yet. Run profile analysis to generate your skill graphs.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="80%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Radar
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}

interface SkillGridProps {
  title: string;
  data: { skill: string; value: number; fullMark: number }[];
  color: string;
}

export function SkillGrid({ title, data, color }: SkillGridProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h3 className="font-heading font-bold text-lg">{title}</h3>
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skill data yet. Run profile analysis to see your skill breakdown.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((skill, index) => {
              const percent = Math.round((skill.value / skill.fullMark) * 100);
              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-xs font-semibold">{percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[color]"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
