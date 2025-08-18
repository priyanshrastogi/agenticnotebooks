'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

import { downloadFile } from '@/lib/file-handling/download-file';
import { FileDataMap } from '@/lib/file-handling/types';

import FileTabs from './FileTabs';
import SheetTabs from './SheetTabs';
import VirtualizedTable from './VirtualizedTable';

type FileViewerProps = {
  filesData: FileDataMap;
  activeFile: string | null;
  setActiveFile: (fileName: string) => void;
  isLoading: boolean;
  error: string | null;
  onAddFiles?: () => void;
};

export default function FileViewer({
  filesData,
  activeFile,
  setActiveFile,
  isLoading,
  error,
  onAddFiles,
}: FileViewerProps) {
  // State for active sheet
  const [activeSheets, setActiveSheets] = useState<Record<string, string>>({});

  // Function to set active sheet for the current file
  const setActiveSheet = (sheetName: string) => {
    if (!activeFile) return;

    setActiveSheets((prev) => ({
      ...prev,
      [activeFile]: sheetName,
    }));
  };

  // Get the active sheet for the current file
  const getActiveSheet = (fileName: string): string => {
    // If we have a saved active sheet, use it
    if (activeSheets[fileName]) {
      return activeSheets[fileName];
    }

    // Otherwise, use the default active sheet from the file data
    if (filesData[fileName] && filesData[fileName].activeSheet) {
      return filesData[fileName].activeSheet;
    }

    return '';
  };

  // Function to handle file download
  const handleDownload = () => {
    if (!activeFile || !filesData[activeFile]) return;

    downloadFile(filesData[activeFile], activeFile);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Early return if data is not valid
  if (!activeFile || !filesData[activeFile]) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No file selected</p>
      </div>
    );
  }

  const fileData = filesData[activeFile];

  // Handle case where sheets is undefined
  if (!fileData.sheets || Object.keys(fileData.sheets).length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">File contains no data</p>
      </div>
    );
  }

  const currentActiveSheet = getActiveSheet(activeFile);

  // Handle case where the active sheet doesn't exist
  if (!currentActiveSheet || !fileData.sheets[currentActiveSheet]) {
    // If the active sheet doesn't exist but there are other sheets, use the first one
    const availableSheets = Object.keys(fileData.sheets);
    if (availableSheets.length > 0) {
      const firstSheet = availableSheets[0];
      setActiveSheet(firstSheet);
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-muted-foreground">Loading sheet...</p>
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No valid sheets found</p>
      </div>
    );
  }

  const sheetData = fileData.sheets[currentActiveSheet];
  const sheetNames = Object.keys(fileData.sheets);

  return (
    <div className="flex h-full w-full flex-col">
      <FileTabs
        filesData={filesData}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        onAddFiles={onAddFiles}
      />
      <div className="flex flex-col">
        <VirtualizedTable data={sheetData.data} columns={sheetData.columns} />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            {sheetNames.length > 1 && (
              <SheetTabs
                sheetNames={sheetNames}
                activeSheet={currentActiveSheet}
                setActiveSheet={setActiveSheet}
              />
            )}
          </div>
          <div className="flex w-[200px] items-center gap-2">
            <button
              onClick={handleDownload}
              className="text-primary hover:bg-secondary/20 flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors"
              title="Download file"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
            <div className="text-muted-foreground whitespace-nowrap py-1 text-sm">
              Total {sheetData.data.length} {sheetData.data.length === 1 ? 'row' : 'rows'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
