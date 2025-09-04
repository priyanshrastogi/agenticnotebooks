'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useNavigationGuard } from 'next-navigation-guard';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

import { Modal } from '@/components/blocks/modal';
import AuthForm from '@/components/pages/Auth/AuthForm';
import { executeGeneratedCode } from '@/lib/code-execution/execute-code';
import { useNavigationBlocker } from '@/lib/contexts/navigation-blocker';
import { formatMessagesForApi, sendChatMessage } from '@/lib/fetch/chat';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCredits } from '@/lib/hooks/use-credits';
import { useFileData } from '@/lib/hooks/use-files-data';
import { type FileWithMetadata, useChatFilesStore } from '@/lib/stores/chatFiles';

import ChatPanel from './ChatPanel';
import FileViewer from './FileViewer';
import { type Message } from './MessageList';

// Utility function to convert string to ArrayBuffer
function s2ab(s: string): ArrayBuffer {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles, addFile, files } = useChatFilesStore();
  const { setIsBlocked } = useNavigationBlocker();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const credits = useCredits();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const {
    filesData,
    fileMetadata,
    activeFile,
    setActiveFile,
    isLoading: isFileLoading,
    error: fileError,
  } = useFileData();

  useNavigationGuard({
    enabled: activeFile !== null,
    confirm: () => window.confirm('Your chats are not saved and will be lost. Leave anyway?'),
  });

  useEffect(() => {
    if (activeFile) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [activeFile, setIsBlocked]);

  useEffect(() => {
    if (files.length === 0) {
      router.push('/new');
    }
  }, [files, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading || !fileMetadata) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${messages.length + 1}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Convert fileMetadata object to array for the API
      const fileMetadataArray = Object.values(fileMetadata);

      // Get the latest accessToken from the query client
      const authData = queryClient.getQueryData(['auth']) as
        | { accessToken: string | null }
        | undefined;
      const currentAccessToken = authData?.accessToken || accessToken || '';

      // Send chat message to API
      const response = await sendChatMessage({
        request: {
          query: inputMessage,
          files: fileMetadataArray,
          conversationId,
          history: messages.length > 0 ? formatMessagesForApi(messages) : undefined,
        },
        accessToken: currentAccessToken,
      });

      // Save conversation ID for follow-up messages
      setConversationId(response.conversationId);

      // Check if code was returned
      if (response.code) {
        try {
          console.log('Generated code:', response.code);
          // Execute the generated code
          const result = await executeGeneratedCode(response.code, filesData);

          if (result) {
            const resultFileName =
              result.newFileName ||
              `Result - ${inputMessage.substring(0, 20)}${inputMessage.length > 20 ? '...' : ''}.xlsx`;

            // Convert result data to Excel file using XLSX library
            const ws = XLSX.utils.json_to_sheet(result.data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Results');

            // Generate blob from workbook
            const blobData = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            const excelBlob = new Blob([s2ab(blobData)], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Create a File object from the blob
            const resultFile = new File([excelBlob], resultFileName, {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            // Add file to store, which will trigger useFileData processing
            addFile({
              file: resultFile,
              id: resultFile.name,
            });

            // Add a message indicating the result was generated
            const resultMessage: Message = {
              id: `msg-${messages.length + 2}`,
              content: result.responseMessage,
              sender: 'ai',
              timestamp: new Date(),
              visualization: result.visualization, // Add visualization if available
            };

            setMessages((prev) => [...prev, resultMessage]);
          } else {
            throw new Error('No valid result was generated');
          }
        } catch (codeError) {
          console.error('Error executing generated code:', codeError);

          // Format the error message
          let errorMessage =
            'I generated some code to analyze your data, but there was an error executing it.';

          if (codeError instanceof Error) {
            errorMessage += ` Error: ${codeError.name}: ${codeError.message}`;
          } else {
            errorMessage += ` An unexpected error occurred.`;
          }

          // Add error message
          const errorResponseMessage: Message = {
            id: `msg-${messages.length + 2}`,
            content: errorMessage,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorResponseMessage]);
        }
      } else {
        // Add AI response (when no code to execute)
        const aiMessage: Message = {
          id: `msg-${messages.length + 2}`,
          content: response.responseText,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
      credits.refetch();
    } catch (error) {
      console.error('Error handling chat submission:', error);
      let content = "Sorry, I couldn't process your request. Please try again.";
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          content =
            'You have reached your limit of requests. Please upgrade to a paid plan to continue.';
        }
      }

      // Add error message
      const errorMessage: Message = {
        id: `msg-${messages.length + 2}`,
        content,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileWithMetadata[] = Array.from(e.target.files).map((file) => ({
        file,
        id: file.name,
      }));

      addFiles(newFiles);

      // Reset the input to allow selecting the same file again
      e.target.value = '';
    }
  };

  const openAuthModal = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleAuthComplete = async () => {
    setIsAuthModalOpen(false);
    setIsLoading(true);
    await credits.refetch();
    const event = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
    handleSubmit(event);
  };

  console.log(fileMetadata);

  return (
    <div className="bg-background text-foreground border-border mx-auto flex h-[calc(100vh-60px)] w-full flex-row border-t">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        multiple
        className="hidden"
      />
      <ChatPanel
        messages={messages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        openAuthModal={openAuthModal}
      />
      <div className="flex h-full w-2/3 flex-col overflow-hidden p-6">
        <div className="flex-1 overflow-hidden">
          <FileViewer
            filesData={filesData}
            activeFile={activeFile}
            setActiveFile={setActiveFile!}
            isLoading={isFileLoading}
            error={fileError}
            onAddFiles={handleAddFiles}
          />
        </div>
      </div>

      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        dialogContentClassName="sm:max-w-md"
      >
        <AuthForm initialMode={authMode} onAuthComplete={handleAuthComplete} />
      </Modal>
    </div>
  );
}
