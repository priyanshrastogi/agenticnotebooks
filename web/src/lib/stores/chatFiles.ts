import { create } from 'zustand'

export interface FileWithMetadata {
  id: string;
  file: File;
}

interface ChatFilesState {
  files: FileWithMetadata[];
  addFile: (file: FileWithMetadata) => void;
  addFiles: (newFiles: FileWithMetadata[]) => void;
  removeFileById: (id: string) => void;
  removeAllFiles: () => void;
}

export const useChatFilesStore = create<ChatFilesState>()((set) => ({
  files: [],
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFileById: (id: string) => set((state) => ({ 
    files: state.files.filter((file) => file.id !== id) 
  })),
  removeAllFiles: () => set({ files: [] }),
}))