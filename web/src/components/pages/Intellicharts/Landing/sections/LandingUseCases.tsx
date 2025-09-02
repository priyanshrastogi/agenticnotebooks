import React from 'react';

export function LandingUseCases() {
  return (
    <section id="use-cases" className="bg-background border-border relative z-10 border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Who Can Benefit</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Intellicharts transforms raw data from any source into professional visualizations
            that tell your story clearly.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Use Case 1 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Data Scientists</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Quickly visualize complex datasets from APIs, databases, or files without writing visualization code.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;Create a heatmap from this JSON API response&rdquo;
            </div>
          </div>
          {/* Use Case 2 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Product Managers</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Turn user analytics and product metrics into compelling charts for stakeholder presentations.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;Visualize user engagement trends from this CSV export&rdquo;
            </div>
          </div>
          {/* Use Case 3 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Developers</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Create charts from API responses, logs, or any structured data format instantly.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;Parse this XML response and show trends over time&rdquo;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
