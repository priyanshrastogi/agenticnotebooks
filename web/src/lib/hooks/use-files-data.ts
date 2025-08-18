import { useEffect,useState } from 'react';

import { FileDataMap, FileMetadataMap, FileProcessingService } from '@/lib/file-handling';
import { useChatFilesStore } from '@/lib/stores/chatFiles';

export const useFileData = () => {
  const { files } = useChatFilesStore();
  const [filesData, setFilesData] = useState<FileDataMap>({});
  const [fileMetadata, setFileMetadata] = useState<FileMetadataMap>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevFileCount, setPrevFileCount] = useState(0);

  useEffect(() => {
    const loadFileData = async () => {
      if (files.length === 0) {
        setFilesData({});
        setFileMetadata({});
        setActiveFile(null);
        setPrevFileCount(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create a map of existing files by name for quick lookup
        const fileMap = new Map(files.map((f) => [f.file.name, f.file]));

        // Create new data objects to store updated state
        const updatedData: FileDataMap = {};
        const updatedMetadata: FileMetadataMap = {};

        // Track new files to potentially set as active
        const newFiles: string[] = [];

        // First, copy over data for files that still exist
        // This prevents reprocessing files that were already processed
        for (const fileName in filesData) {
          if (fileMap.has(fileName)) {
            updatedData[fileName] = filesData[fileName];
            if (fileMetadata[fileName]) {
              updatedMetadata[fileName] = fileMetadata[fileName];
            }
          }
        }

        // Process any new files that haven't been processed yet
        for (const fileWithMetadata of files) {
          const { file } = fileWithMetadata;

          // Skip if already processed above
          if (updatedData[file.name]) continue;

          // Only process supported files
          if (FileProcessingService.isFileSupported(file)) {
            try {
              // Use the FileProcessingService to process each file
              const { fileData, fileMetadata: newFileMetadata } =
                await FileProcessingService.processFile(file);

              updatedData[file.name] = fileData;
              updatedMetadata[file.name] = newFileMetadata;

              // Track this as a new file
              newFiles.push(file.name);
            } catch (fileError) {
              console.error(`Error processing file ${file.name}:`, fileError);
              // Continue with other files even if one fails
            }
          }
        }

        setFilesData(updatedData);
        setFileMetadata(updatedMetadata);

        // Check if we have new files (files were added)
        const filesWereAdded = files.length > prevFileCount && newFiles.length > 0;

        if (filesWereAdded) {
          // Set the most recently added file as active
          setActiveFile(newFiles[newFiles.length - 1]);
        } else if (!activeFile || !updatedData[activeFile]) {
          // If active file was deleted or there is no active file yet
          const fileNames = Object.keys(updatedData);
          if (fileNames.length > 0) {
            setActiveFile(fileNames[0]);
          } else {
            setActiveFile(null);
          }
        }

        // Update previous file count for next comparison
        setPrevFileCount(files.length);
      } catch (err) {
        console.error('Error processing files:', err);
        setError('Failed to process spreadsheet files.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    if (activeFile && filesData && Object.keys(filesData).length > 0) {
      // If active file no longer exists in the filesData, select the first available file
      if (!filesData[activeFile]) {
        const fileNames = Object.keys(filesData);
        if (fileNames.length > 0) {
          setActiveFile(fileNames[0]);
        }
      }
    }
  }, [activeFile, filesData]);

  return {
    filesData,
    fileMetadata,
    activeFile,
    setActiveFile,
    isLoading,
    error,
    hasFiles: Object.keys(filesData).length > 0,
  };
};
