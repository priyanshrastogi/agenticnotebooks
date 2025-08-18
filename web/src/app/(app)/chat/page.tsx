import { Metadata } from 'next';

import Chat from '@/components/pages/Chat';

export const metadata: Metadata = {
  title: 'Data Analysis | Intellicharts',
};

export default function ChatPage() {
  return <Chat />;
}
