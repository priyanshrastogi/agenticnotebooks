'use client';

import { FileCheck,FileSpreadsheet, FileX, Upload } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect,useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useChatFilesStore } from '@/lib/stores/chatFiles';
import { cn } from '@/lib/utils';

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
};

export default function NewChat() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles, removeAllFiles } = useChatFilesStore();
  const router = useRouter();

  useEffect(() => {
    removeAllFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const newFiles = validFiles.map((file) => ({
      id: file.name,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const startAnalysis = () => {
    addFiles(
      uploadedFiles.map((file) => ({
        file: file.file,
        id: file.id,
      }))
    );
    router.push('/chat');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="border-border w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-center gap-2 text-center text-2xl font-bold">
            <FileSpreadsheet className="text-primary h-6 w-6" />
            New Analysis
          </CardTitle>
          <CardDescription className="text-center">
            Import your spreadsheet files to chat with your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border',
              uploadedFiles.length > 0 ? 'py-4' : 'py-10'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <div>
              <p className="mb-1 font-medium">Drag files here or click to import</p>
              <p className="text-muted-foreground text-sm">Supports Excel and CSV files</p>
            </div>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Selected Files</h3>
              <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-secondary/10 flex items-center justify-between rounded-md p-2"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCheck className="text-primary h-4 w-4 flex-shrink-0" />
                      <div className="truncate">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 rounded-full"
                      onClick={() => removeFile(file.id)}
                    >
                      <FileX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={startAnalysis} disabled={uploadedFiles.length === 0}>
            Start Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
