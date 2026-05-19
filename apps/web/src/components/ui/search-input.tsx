'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus-visible:ring-[#C9A84C]"
      />
    </div>
  );
}
