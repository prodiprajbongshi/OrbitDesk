'use client';

import React from 'react';
import { getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  name: string;
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { box: 'w-6 h-6', text: 'text-[10px]', ring: 'w-2 h-2' },
  sm: { box: 'w-8 h-8', text: 'text-xs', ring: 'w-2.5 h-2.5' },
  md: { box: 'w-10 h-10', text: 'text-sm', ring: 'w-3 h-3' },
  lg: { box: 'w-12 h-12', text: 'text-base', ring: 'w-3.5 h-3.5' },
  xl: { box: 'w-16 h-16', text: 'text-xl', ring: 'w-4 h-4' },
};

export default function Avatar({ name, initials, size = 'md', online, className = '' }: AvatarProps) {
  const color = getAvatarColor(name);
  const sz = sizeMap[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sz.box} rounded-full flex items-center justify-center font-semibold text-white ${sz.text}`}
        style={{ backgroundColor: color }}
        title={name}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${sz.ring} rounded-full border-2 border-white dark:border-gray-800 ${online ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  members,
  max = 4,
  size = 'sm',
}: {
  members: { name: string; initials: string }[];
  max?: number;
  size?: AvatarProps['size'];
}) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  const sz = sizeMap[size];

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <Avatar
          key={i}
          name={m.name}
          initials={m.initials}
          size={size}
          className="ring-2 ring-white dark:ring-gray-800"
        />
      ))}
      {extra > 0 && (
        <div
          className={`${sz.box} rounded-full flex items-center justify-center ${sz.text} font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
