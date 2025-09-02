import { BarChart, Clock, FileSpreadsheet,PlayCircle, Search, Shield, Upload } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React, { useCallback,useState } from 'react';

import { useChatFilesStore } from '@/lib/stores/chatFiles';
import { cn } from '@/lib/utils';

export function LandingAppPreview() {
  const [isDragging, setIsDragging] = useState(false);
  const { addFiles } = useChatFilesStore();
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);

    // Filter for only Excel and CSV files
    const validFiles = fileArray.filter(
      (file) =>
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'text/csv' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.csv')
    );

    addFiles(
      validFiles.map((file) => ({
        id: file.name,
        file: file,
      }))
    );

    router.push('/chat');
  };

  const openFileSelector = () => {
    document.getElementById('landing-file-upload')?.click();
  };

  // Sample prompts to showcase AgenticRows capabilities
  const samplePrompts = [
    {
      icon: <FileSpreadsheet className="text-primary h-5 w-5 flex-shrink-0" />,
      text: 'Match orders from sales.xlsx with inventory.xlsx',
    },
    {
      icon: <Search className="text-primary h-5 w-5 flex-shrink-0" />,
      text: 'Who are my top 10 customers by revenue?',
    },
    {
      icon: <BarChart className="text-primary h-5 w-5 flex-shrink-0" />,
      text: 'Visualize customer age groups',
    },
    {
      icon: <Clock className="text-primary h-5 w-5 flex-shrink-0" />,
      text: 'Compare quarterly sales by region',
    },
  ];

  return (
    <div className="relative z-10 mx-auto mb-28 w-full max-w-4xl px-4">
      <div className="flex flex-col items-center space-y-6">
        <div
          className={cn(
            'border-border relative flex min-h-[300px] w-full max-w-4xl cursor-pointer flex-col items-center justify-center gap-6 rounded-lg border border-dashed px-4 py-10 text-center transition-all sm:px-10',
            isDragging ? 'border-primary bg-primary/5 border-2' : ''
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          {/* Try Now Badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Try now</span>
          </div>

          {/* Data Stays Private Badge */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
            <Shield className="h-3.5 w-3.5" />
            <span>Data stays private</span>
          </div>

          <div className="mt-6 w-full">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {samplePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="bg-primary/10 flex cursor-default items-center gap-2 rounded-md p-3"
                >
                  {prompt.icon}
                  <span className="text-secondary-foreground text-xs sm:text-sm">
                    {prompt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/10 mt-4 rounded-full p-4">
            <Upload className="text-primary h-8 w-8" />
          </div>

          <div className="mb-6">
            <p className="mb-1 text-xl font-medium">
              Drag spreadsheet files here or click to import
            </p>
            <p className="text-muted-foreground">Supports Excel and CSV files</p>
          </div>

          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="hidden"
            id="landing-file-upload"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
