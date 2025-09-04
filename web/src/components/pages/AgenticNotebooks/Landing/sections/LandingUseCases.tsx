import React from 'react';

export function LandingUseCases() {
  return (
    <section id="use-cases" className="bg-background border-border relative z-10 border-y py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Who Can Benefit</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            AgenticNotebooks helps anyone who works with spreadsheet data—all while keeping your
            information private.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Use Case 1 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Business Analysts</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Speed up your workflow and focus on insights instead of data prep.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;Compare quarterly performance across all regions&rdquo;
            </div>
          </div>
          {/* Use Case 2 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Marketing Teams</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Understand campaign performance without waiting for analyst support.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;Show me which campaigns had the highest ROI last month&rdquo;
            </div>
          </div>
          {/* Use Case 3 */}
          <div className="bg-background border-border flex h-full flex-col rounded-xl border p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">For Business Professionals</h3>
            <p className="text-muted-foreground mb-4 flex-grow">
              Get the data insights you need without Excel expertise.
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic">
              &ldquo;What&rsquo;s driving our customer churn rate?&rdquo;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
