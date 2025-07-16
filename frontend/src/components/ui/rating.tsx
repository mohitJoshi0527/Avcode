import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RatingProps {
  value: number;
  onChange: (newVal: number) => void;
  max?: number;
}

export function Rating({ value, onChange, max = 5 }: RatingProps) {
  return (
    <div className="inline-flex space-x-1">
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        return (
          <Button
            key={idx}
            size="icon"
            variant="ghost"
            onClick={() => onChange(idx)}
            className={idx <= value ? 'text-yellow-400' : 'text-gray-300'}
          >
            <Star size={20} />
          </Button>
        );
      })}
    </div>
  );
}
