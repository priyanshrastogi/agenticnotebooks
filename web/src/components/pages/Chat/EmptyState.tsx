'use client';

import { MessageSquare } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <MessageSquare className="text-primary h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-medium">Ready to analyze your data</h3>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ask questions about your spreadsheet data to get insights.
      </p>
    </div>
  );
}
