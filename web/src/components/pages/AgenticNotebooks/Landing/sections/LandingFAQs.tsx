'use client';

import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItemProps {
  question: string;
  answer: string;
  value: string;
}

const FAQItem = ({ question, answer, value }: FAQItemProps) => {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left text-lg font-medium">{question}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
    </AccordionItem>
  );
};

export function LandingFAQs() {
  return (
    <section id="faqs" className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">FAQs</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Common questions about AgenticNotebooks
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <FAQItem
            value="item-1"
            question="What is AgenticNotebooks and how does it work?"
            answer="AgenticNotebooks is a privacy-focused AI agent for data analysis that allows you to analyze spreadsheets using plain English. Simply import your Excel/CSV file, ask questions in natural language, and get instant insights and visualizations—all without needing to know formulas or technical skills."
          />
          <FAQItem
            value="item-2"
            question="How does AgenticNotebooks keep my data private?"
            answer="Your data never leaves your browser. AgenticNotebooks only processes column names and data types—never your actual data values. This browser-only approach ensures your sensitive information remains completely private."
          />
          <FAQItem
            value="item-3"
            question="What file formats and sizes are supported?"
            answer="Currently, AgenticNotebooks supports Excel files (.xlsx, .xls) and CSV files (.csv) up to 10MB in size. We plan to expand these options in future updates."
          />
          <FAQItem
            value="item-4"
            question="Do I need Excel skills to use AgenticNotebooks?"
            answer="Not at all! That's the whole point of AgenticNotebooks. You don't need any knowledge of Excel formulas, pivot tables, or functions. Simply ask questions in plain English, and we'll handle the technical aspects for you."
          />
          <FAQItem
            value="item-5"
            question="What kinds of analysis can I perform?"
            answer="You can perform a wide range of analyses including summary statistics, trend identification, data filtering, creating calculated columns, generating visualizations, and data cleaning—all through simple conversation."
          />
          <FAQItem
            value="item-6"
            question="Is AgenticNotebooks free to use?"
            answer="We offer a free tier with basic functionality and limited usage. For more advanced features and higher usage limits, we offer premium subscription plans."
          />
          <FAQItem
            value="item-7"
            question="What browsers does AgenticNotebooks support?"
            answer="AgenticNotebooks works with all modern browsers including Chrome (recommended), Firefox, Safari, and Edge. The current version is optimized for desktop and tablet use."
          />
        </Accordion>
      </div>
    </section>
  );
}
