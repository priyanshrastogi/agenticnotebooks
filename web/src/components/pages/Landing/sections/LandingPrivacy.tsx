'use client';

import { ArrowDown,ArrowRight, Database, File, FileText, Lock, Shield } from 'lucide-react';
import React from 'react';

interface PrivacyPillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PrivacyPillar = ({ icon, title, description }: PrivacyPillarProps) => {
  return (
    <div className="bg-background border-border rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="bg-primary/10 text-primary mb-5 flex h-12 w-12 items-center justify-center rounded-lg">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export function LandingPrivacy() {
  return (
    <section id="privacy" className="bg-background border-border border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Privacy-First Data Analysis</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Unlike other tools, Intellicharts processes your data entirely within your browser.
          </p>
        </div>

        <div className="mb-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <PrivacyPillar
            icon={<Lock className="h-6 w-6" />}
            title="Browser-Only Processing"
            description="Your spreadsheet data remains in your browser and is never sent to our servers."
          />
          <PrivacyPillar
            icon={<FileText className="h-6 w-6" />}
            title="Metadata-Only Access"
            description="We only access column names and data types—never the actual values in your spreadsheets."
          />
          <PrivacyPillar
            icon={<Database className="h-6 w-6" />}
            title="No Data Storage"
            description="We don't store or retain any of your spreadsheet content, ensuring complete confidentiality."
          />
        </div>

        {/* Improved Data Flow Visualization */}
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-10 text-center text-2xl font-semibold">How Your Data Stays Private</h3>

          <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row md:items-stretch md:gap-0">
            {/* Browser Side */}
            <div className="flex w-full flex-col rounded-3xl border border-emerald-200 bg-emerald-100/50 p-6 md:w-[45%] md:p-8 dark:border-emerald-800/50 dark:bg-emerald-900/10">
              <h3 className="mb-6 text-center text-xl font-semibold">Your Browser</h3>

              <div className="bg-background border-border mb-8 flex-grow rounded-xl border p-6 shadow-sm">
                <div className="mb-5 flex justify-center">
                  <div className="rounded-full bg-blue-100/70 p-4 dark:bg-blue-900/20">
                    <File className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-muted h-3 w-[60%] rounded-full"></div>
                  <div className="bg-muted h-3 w-[80%] rounded-full"></div>
                  <div className="bg-muted h-3 w-[70%] rounded-full"></div>
                </div>
              </div>

              <div className="text-muted-foreground flex items-center justify-center gap-3 text-sm">
                <Lock className="h-5 w-5 text-emerald-500" />
                <span>Your spreadsheet data stays here</span>
              </div>
            </div>

            {/* Data Flow Indicator - Desktop */}
            <div className="absolute left-[38%] right-[38%] top-1/2 hidden -translate-y-1/2 transform flex-col items-center md:flex">
              <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-blue-400 to-blue-500"></div>

              <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 transform">
                <div className="rounded-md bg-blue-500 p-1">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="bg-background border-border absolute top-0 -translate-y-8 transform whitespace-nowrap rounded-full border px-4 py-1 text-sm shadow-sm">
                Only column metadata
              </div>
            </div>

            {/* Data Flow Indicator - Mobile (Vertical) */}
            <div className="relative flex h-16 items-center justify-center md:hidden">
              <div className="absolute h-full w-0.5 bg-gradient-to-b from-emerald-400 to-blue-500">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform">
                  <div className="rounded-md bg-blue-500 p-1">
                    <ArrowDown className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-background border-border absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform whitespace-nowrap rounded-full border px-4 py-1 text-sm shadow-sm">
                <span>Only column metadata</span>
              </div>
            </div>

            {/* Server Side */}
            <div className="flex w-full flex-col rounded-3xl border border-blue-200 bg-blue-100/50 p-6 md:w-[45%] md:p-8 dark:border-blue-800/50 dark:bg-blue-900/10">
              <h3 className="mb-6 text-center text-xl font-semibold">Intellicharts Servers</h3>

              <div className="bg-background border-border mb-8 flex-grow rounded-xl border p-6 shadow-sm">
                <div className="mb-5 flex justify-center">
                  <div className="rounded-full bg-blue-100/70 p-4 dark:bg-blue-900/20">
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="flex h-[60px] flex-col items-center justify-center">
                  {/* Empty state representing no data storage */}
                </div>
              </div>

              <div className="text-muted-foreground flex items-center justify-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>No actual data is stored here</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-10">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
              <span className="text-muted-foreground text-sm">Protected Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-400"></div>
              <span className="text-muted-foreground text-sm">Metadata Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground text-sm">Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
