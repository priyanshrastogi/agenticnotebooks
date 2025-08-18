import { BarChart3, Bot, Code2, Download, Palette, Sparkles } from 'lucide-react';
import React from 'react';

export function LandingFeatures() {
  return (
    <section id="features" className="bg-background border-y border-border relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-5 text-3xl font-bold md:text-4xl">
            Intelligent Charting That Understands Your Data
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Our AI agent automatically parses any data format and creates the perfect
            visualization, saving hours of manual chart creation.
          </p>
        </div>
        
        {/* First row of features */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 mb-16">
          {/* Feature 1 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Code2 className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Universal Data Support</h3>
            <p className="text-muted-foreground">
              Import JSON, CSV, XML, HTML tables, or connect to APIs - we handle any data format.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Bot className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">AI-Powered Parsing</h3>
            <p className="text-muted-foreground">
              Our intelligent agent understands your data structure and automatically creates the right chart type.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Rich Chart Library</h3>
            <p className="text-muted-foreground">
              Bar, line, pie, scatter, heatmaps, and more - all chart types at your fingertips.
            </p>
          </div>
        </div>
        
        {/* Second row of features - centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Feature 4 */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Palette className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Full Customization</h3>
            <p className="text-muted-foreground">
              Customize colors, styles, labels, and layouts to match your brand or preferences.
            </p>
          </div>
          
          {/* Feature 5 - Export */}
          <div className="bg-background border-border rounded-xl border p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-lg">
              <Download className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-semibold">Export Anywhere</h3>
            <p className="text-muted-foreground">
              Export your charts as PNG, SVG, or interactive HTML. Embed them in presentations, reports, or websites.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
