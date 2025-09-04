import { Metadata } from 'next';

import Chat from '@/components/pages/AgenticNotebooks/Chat';

export const metadata: Metadata = {
  title: 'Data Analysis | Intellicharts',
};

export default function ChatPage() {
  return <Chat />;
}
