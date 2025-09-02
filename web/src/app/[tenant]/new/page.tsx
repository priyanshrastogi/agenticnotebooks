import { Metadata } from 'next';

import NewChat from '@/components/pages/AgenticRows/New';

export const metadata: Metadata = {
  title: 'New Analysis | Intellicharts',
  description: 'Upload your Excel or CSV file to start analyzing your data with natural language.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://intellicharts.com/new',
  },
};

export default async function NewChatPage() {
  return <NewChat />;
}
