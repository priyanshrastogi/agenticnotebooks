'use client';

import {
  BarChart2,
  Download,
  ExternalLink,
  FileCheck,
  FilePlus,
  FileSpreadsheet,
  FileX,
  Grid,
  Info,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

import Link from '@/components/blocks/custom-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data for files
const mockFiles = [
  {
    id: 'file-1',
    name: 'Q3_Sales_Report.xlsx',
    type: 'xlsx',
    size: '2.4 MB',
    rows: 1254,
    columns: 18,
    lastUpdated: new Date(2023, 10, 15, 14, 30),
    description: 'Quarterly sales data with regional breakdowns and product categories',
  },
  {
    id: 'file-2',
    name: 'Regional_Data.csv',
    type: 'csv',
    size: '1.2 MB',
    rows: 845,
    columns: 12,
    lastUpdated: new Date(2023, 10, 15, 14, 30),
    description: 'Regional sales data for Q3 with demographic information',
  },
  {
    id: 'file-3',
    name: 'Marketing_Campaigns_2023.xlsx',
    type: 'xlsx',
    size: '3.8 MB',
    rows: 2150,
    columns: 24,
    lastUpdated: new Date(2023, 10, 10, 9, 45),
    description: 'Marketing campaign performance data with ROI calculations',
  },
  {
    id: 'file-4',
    name: 'Customer_Data.xlsx',
    type: 'xlsx',
    size: '4.5 MB',
    rows: 3278,
    columns: 32,
    lastUpdated: new Date(2023, 9, 28, 16, 20),
    description: 'Customer details including purchase history and preferences',
  },
  {
    id: 'file-5',
    name: 'Support_Tickets.csv',
    type: 'csv',
    size: '980 KB',
    rows: 724,
    columns: 15,
    lastUpdated: new Date(2023, 9, 28, 16, 20),
    description: 'Customer support ticket data with resolution times',
  },
  {
    id: 'file-6',
    name: 'Feedback_Survey.xlsx',
    type: 'xlsx',
    size: '1.7 MB',
    rows: 1120,
    columns: 22,
    lastUpdated: new Date(2023, 9, 28, 16, 20),
    description: 'Customer satisfaction survey results with demographic breakdown',
  },
  {
    id: 'file-7',
    name: 'Inventory_Q3.xlsx',
    type: 'xlsx',
    size: '3.2 MB',
    rows: 1875,
    columns: 28,
    lastUpdated: new Date(2023, 9, 20, 11, 15),
    description: 'Inventory tracking data with stock levels and reorder points',
  },
  {
    id: 'file-8',
    name: 'HR_Budget_2023.xlsx',
    type: 'xlsx',
    size: '1.9 MB',
    rows: 625,
    columns: 20,
    lastUpdated: new Date(2023, 9, 15, 15, 0),
    description: 'HR department budget breakdown and employee cost analysis',
  },
  {
    id: 'file-9',
    name: 'Department_Expenses.csv',
    type: 'csv',
    size: '750 KB',
    rows: 412,
    columns: 14,
    lastUpdated: new Date(2023, 9, 15, 15, 0),
    description: 'Departmental expense tracking with monthly comparisons',
  },
  {
    id: 'file-10',
    name: 'Annual_Financial_Performance_Report_2023_Consolidated_Data_Q1_Q4.xlsx',
    type: 'xlsx',
    size: '5.7 MB',
    rows: 3842,
    columns: 42,
    lastUpdated: new Date(2023, 11, 20, 16, 45),
    description:
      'Comprehensive annual financial performance analysis with quarterly breakdowns, department comparisons, and year-over-year growth metrics for all business units and product lines',
  },
  {
    id: 'file-11',
    name: 'Global_Market_Research_and_Competitor_Analysis_2023_Complete_Dataset.xlsx',
    type: 'xlsx',
    size: '8.2 MB',
    rows: 5260,
    columns: 38,
    lastUpdated: new Date(2023, 11, 15, 10, 30),
    description:
      'Detailed market research data covering global regions with competitor performance metrics, market share analysis, and consumer sentiment tracking across multiple product categories',
  },
  {
    id: 'file-12',
    name: 'Customer_Demographic_Segmentation_and_Purchasing_Behavior_Analysis.csv',
    type: 'csv',
    size: '3.4 MB',
    rows: 2840,
    columns: 26,
    lastUpdated: new Date(2023, 11, 10, 9, 15),
    description:
      'In-depth customer segmentation data with demographic breakdowns, purchasing patterns, lifetime value calculations, and predictive behavior models for strategic marketing initiatives',
  },
];

const formatDate = (date: Date) => {
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

// Function to truncate filename while preserving extension
const formatFileName = (fileName: string, maxLength = 20) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) return fileName;

  const name = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex);

  if (name.length <= maxLength) return fileName;

  return `${name.substring(0, maxLength)}...${extension}`;
};

const GridCard = ({ file }: { file: (typeof mockFiles)[0] }) => (
  <Card key={file.id} className="hover:border-secondary/80 overflow-hidden py-0 transition-all">
    <CardContent className="p-0">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded',
                file.type === 'xlsx'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              )}
            >
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="max-w-[calc(100%-3rem)]">
              <h3 className="text-foreground truncate text-base font-medium" title={file.name}>
                {formatFileName(file.name)}
              </h3>
              <p className="text-muted-foreground text-xs">{formatDate(file.lastUpdated)}</p>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mt-4 line-clamp-2 h-10 overflow-hidden text-sm">
          {file.description}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center">
            <span className="text-muted-foreground">Size:</span>
            <span className="ml-1 font-medium">{file.size}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-1 font-medium uppercase">{file.type}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground">Rows:</span>
            <span className="ml-1 font-medium">{file.rows.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground">Columns:</span>
            <span className="ml-1 font-medium">{file.columns}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Info className="text-muted-foreground h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Download className="text-muted-foreground h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Trash2 className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>
        <Link href={`/chat/new?file=${file.id}`}>
          <Button size="sm" className="h-8">
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            Analyze
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// List view row
const ListCard = ({ file }: { file: (typeof mockFiles)[0] }) => (
  <Card key={file.id} className="hover:border-secondary/80 overflow-hidden py-0 transition-all">
    <CardContent className="p-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-1 items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded',
              file.type === 'xlsx'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            )}
          >
            <FileSpreadsheet className="h-5 w-5" />
          </div>

          <div className="min-w-0 max-w-[calc(100%-15rem)] flex-1">
            <h3 className="text-foreground truncate text-base font-medium" title={file.name}>
              {formatFileName(file.name, 40)}
            </h3>
            <p className="text-muted-foreground text-xs">{formatDate(file.lastUpdated)}</p>
          </div>

          <div className="text-muted-foreground hidden items-center gap-4 text-xs md:flex">
            <div className="flex items-center">
              <span>{file.size}</span>
            </div>
            <div className="flex items-center">
              <span>{file.rows.toLocaleString()} rows</span>
            </div>
            <div className="flex items-center">
              <span>{file.columns} columns</span>
            </div>
          </div>

          <div className="ml-4 flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Info className="text-muted-foreground h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Download className="text-muted-foreground h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Trash2 className="text-muted-foreground h-4 w-4" />
            </Button>
            <Link href={`/chat/new?file=${file.id}`}>
              <Button size="sm" className="h-8">
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                Analyze
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export default function Files() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Filter files based on search term
  const filteredFiles = mockFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

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
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFiles = () => {
    setUploadedFiles([]);
    setUploadDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
            <FileSpreadsheet className="text-primary h-7 w-7" />
            Files
          </h1>
          <p className="text-muted-foreground">Manage your uploaded spreadsheets and CSV files</p>
        </div>
        <Button
          className="shadow-sm transition-all hover:shadow"
          onClick={() => setUploadDialogOpen(true)}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
          <Input
            placeholder="Search files by name or description..."
            className="border-muted-foreground/20 focus:border-primary h-11 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setViewMode('list')}
          >
            <BarChart2 className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {filteredFiles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => (
              <GridCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredFiles.map((file) => (
              <ListCard key={file.id} file={file} />
            ))}
          </div>
        )
      ) : (
        <div className="bg-secondary/5 border-muted-foreground/20 rounded border border-dashed py-16 text-center">
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <FileSpreadsheet className="text-primary h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No files found</h3>
          <p className="text-muted-foreground mx-auto mb-6 max-w-md">
            {searchTerm
              ? 'No files match your search criteria'
              : "You haven't uploaded any files yet"}
          </p>
          <Button
            className="shadow-sm transition-all hover:shadow"
            onClick={() => setUploadDialogOpen(true)}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Upload a File
          </Button>
        </div>
      )}

      {/* Upload File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="text-primary h-5 w-5" />
              Upload Files
            </DialogTitle>
            <DialogDescription className="text-center">
              Upload your spreadsheet or CSV files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-border',
                uploadedFiles.length > 0 ? 'py-4' : 'py-8'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload
                className={cn(
                  'h-8 w-8 transition-colors',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <div>
                <p className="mb-1 font-medium">Drag files here or click to upload</p>
                <p className="text-muted-foreground text-sm">Supports Excel and CSV files</p>
              </div>
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="mt-2"
              >
                <Plus className="mr-1 h-4 w-4" /> Select Files
              </Button>
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
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(file.size)}
                          </p>
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

            <div className="mt-4 flex justify-end">
              <Button onClick={uploadFiles} disabled={uploadedFiles.length === 0}>
                Upload Files
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
