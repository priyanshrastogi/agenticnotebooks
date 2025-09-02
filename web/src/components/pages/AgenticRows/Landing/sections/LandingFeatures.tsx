import { LineChart, MessageSquare, Shield,Upload, Wand2 } from 'lucide-react';
import React from 'react';

export function LandingFeatures() {
  return (
    <section id="features" className="bg-background border-y border-border relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-5 text-3xl font-bold md:text-4xl">
            Spreadsheet Analysis Without The Learning Curve
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Get insights from your data without needing to learn complex formulas or technical
            skills. All with complete privacy.
          </p>
        </div>
        
        {/* First row of features */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 mb-16">
          {/* Feature 1 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Import & Analyze</h3>
            <p className="text-muted-foreground">
              Instantly import Excel and CSV files to begin your analysis.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Ask In Plain English</h3>
            <p className="text-muted-foreground">
              No formulas needed - just ask questions like &ldquo;What were my top 5 products last
              quarter?&rdquo;
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <LineChart className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Beautiful Visualizations</h3>
            <p className="text-muted-foreground">
              Automatically generate charts and graphs that best represent your data.
            </p>
          </div>
        </div>
        
        {/* Second row of features - centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Feature 4 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Wand2 className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Clean & Transform Data</h3>
            <p className="text-muted-foreground">
              Clean, filter, and transform your data through simple conversation.
            </p>
          </div>
          
          {/* Feature 5 - Privacy */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Complete Data Privacy</h3>
            <p className="text-muted-foreground">
              Your data never leaves your browser. We only process metadata like column names and types, keeping your actual data completely private.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
