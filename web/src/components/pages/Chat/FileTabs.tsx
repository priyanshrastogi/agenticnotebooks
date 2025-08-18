'use client';

import { Plus, X } from 'lucide-react';
import { useEffect,useRef, useState } from 'react';

import { FileDataMap } from '@/lib/file-handling/types';
import { useChatFilesStore } from '@/lib/stores/chatFiles';
import { cn } from '@/lib/utils';

type FileTabsProps = {
  filesData: FileDataMap;
  activeFile: string | null;
  setActiveFile: (fileName: string) => void;
  onAddFiles?: () => void;
};

export default function FileTabs({
  filesData,
  activeFile,
  setActiveFile,
  onAddFiles,
}: FileTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabWidth, setTabWidth] = useState<number | undefined>(undefined);
  const fileCount = Object.keys(filesData).length;
  const { removeFileById } = useChatFilesStore();

  // Calculate tab width based on container width and number of tabs
  useEffect(() => {
    const updateTabWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Reserve space for the Add Files button (100px)
        const availableWidth = Math.max(0, containerWidth - 100);
        // Calculate tab width with a minimum of 80px, maximum of 200px
        const calculatedWidth = Math.min(200, Math.max(80, availableWidth / fileCount));
        setTabWidth(calculatedWidth);
      }
    };

    updateTabWidth();

    // Add event listener for window resize
    window.addEventListener('resize', updateTabWidth);

    // Create a MutationObserver to watch for changes to the container's size
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(updateTabWidth);
      resizeObserver.observe(containerRef.current);

      return () => {
        window.removeEventListener('resize', updateTabWidth);
        resizeObserver.disconnect();
      };
    }

    return () => window.removeEventListener('resize', updateTabWidth);
  }, [fileCount]);

  const handleDeleteFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    removeFileById(fileName);

    // If the deleted file was active, set the active file to the first remaining file or null
    if (activeFile === fileName) {
      const remainingFiles = Object.keys(filesData).filter((name) => name !== fileName);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0]);
      } else {
        // No files left, would be handled by parent component
      }
    }
  };

  return (
    <div className="border-border mb-6 flex w-full border-b" ref={containerRef}>
      <div className="flex flex-1 overflow-hidden">
        {Object.entries(filesData).map(([fileName]) => (
          <div
            key={fileName}
            className={cn(
              'flex items-center overflow-hidden',
              activeFile === fileName
                ? 'border-primary text-foreground border-b-2'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'
            )}
            style={{
              width: tabWidth ? `${tabWidth}px` : 'auto',
              minWidth: '80px',
              maxWidth: '200px',
            }}
          >
            <button
              className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors focus:outline-none"
              onClick={() => setActiveFile(fileName)}
              title={fileName}
            >
              {fileName}
            </button>
            <button
              className="text-muted-foreground hover:text-destructive mr-1 p-1 transition-colors"
              onClick={(e) => handleDeleteFile(e, fileName)}
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAddFiles}
        className="text-primary hover:bg-secondary/20 ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        <span>Add Files</span>
      </button>
    </div>
  );
}
