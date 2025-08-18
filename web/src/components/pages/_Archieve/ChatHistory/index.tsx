'use client';

import { ChevronRight,FileSpreadsheet, MessageSquare, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import Link from '@/components/blocks/custom-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data for chat history
const mockChatHistory = [
  {
    id: 'chat-1',
    title: 'Q3 Sales Analysis',
    lastUpdated: new Date(2023, 10, 15, 14, 30),
    fileCount: 2,
    fileNames: ['Q3_Sales_Report.xlsx', 'Regional_Data.csv'],
  },
  {
    id: 'chat-2',
    title: 'Marketing Campaign ROI',
    lastUpdated: new Date(2023, 10, 10, 9, 45),
    fileCount: 1,
    fileNames: ['Marketing_Campaigns_2023.xlsx'],
  },
  {
    id: 'chat-3',
    title: 'Customer Retention Analysis',
    lastUpdated: new Date(2023, 9, 28, 16, 20),
    fileCount: 3,
    fileNames: ['Customer_Data.xlsx', 'Support_Tickets.csv', 'Feedback_Survey.xlsx'],
  },
  {
    id: 'chat-4',
    title: 'Inventory Management',
    lastUpdated: new Date(2023, 9, 20, 11, 15),
    fileCount: 1,
    fileNames: ['Inventory_Q3.xlsx'],
  },
  {
    id: 'chat-5',
    title: 'HR Department Budget',
    lastUpdated: new Date(2023, 9, 15, 15, 0),
    fileCount: 2,
    fileNames: ['HR_Budget_2023.xlsx', 'Department_Expenses.csv'],
  },
];

export default function ChatHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats based on search term
  const filteredChats = mockChatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.fileNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date to "Last updated dd mmm yyyy, hh:mm aa" format
  const formatDateTime = (date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

    return `Last updated ${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
            <MessageSquare className="text-primary h-7 w-7" />
            Chat History
          </h1>
          <p className="text-muted-foreground">Access your previous conversations with your data</p>
        </div>
        <Link href="/new">
          <Button className="shadow-sm transition-all hover:shadow">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
        <Input
          placeholder="Search chats by title or filename..."
          className="border-muted-foreground/20 focus:border-primary h-11 pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredChats.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredChats.map((chat) => (
            <div key={chat.id}>
              <Link href={`/chat/${chat.id}`}>
                <Card className="hover:border-secondary/80 hover:bg-secondary/80 border-muted-foreground/10 cursor-pointer overflow-hidden py-0 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-full space-y-2">
                        <h2 className="text-foreground flex items-center gap-2 text-base font-medium">
                          <MessageSquare className="text-primary h-4 w-4" />
                          {chat.title}
                        </h2>

                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                          <span>{formatDateTime(chat.lastUpdated)}</span>
                          <span className="flex items-center">
                            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                            {chat.fileCount} {chat.fileCount === 1 ? 'file' : 'files'}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {chat.fileNames.map((fileName, index) => (
                            <div
                              key={index}
                              className={cn(
                                'bg-secondary text-muted-foreground flex items-center rounded px-2 py-1 text-xs',
                                fileName.endsWith('.xlsx') && 'border-l-2 border-blue-500/70',
                                fileName.endsWith('.csv') && 'border-l-2 border-emerald-500/70'
                              )}
                            >
                              <FileSpreadsheet className="mr-1 h-3 w-3" />
                              {fileName}
                            </div>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground ml-4 h-4 w-4 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-secondary/5 border-muted-foreground/20 rounded border border-dashed py-16 text-center">
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <MessageSquare className="text-primary h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No chats found</h3>
          <p className="text-muted-foreground mx-auto mb-6 max-w-md">
            {searchTerm
              ? 'No chats match your search criteria'
              : "You haven't started any chats yet"}
          </p>
          <Link href="/new">
            <Button className="shadow-sm transition-all hover:shadow">
              <Plus className="mr-2 h-4 w-4" />
              Start a New Analysis
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
