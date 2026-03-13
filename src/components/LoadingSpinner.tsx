import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <Loader2 className="w-8 h-8 text-wedding-accent animate-spin" strokeWidth={1.5} />
    </div>
  );
}
