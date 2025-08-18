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
            Common questions about Intellicharts
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <FAQItem
            value="item-1"
            question="What is Intellicharts and how does it work?"
            answer="Intellicharts is an AI-powered charting agent that transforms any data source into beautiful visualizations. Simply provide your data in any format (JSON, CSV, XML, API, HTML), and our AI automatically parses it and creates the perfect chart type for your needs."
          />
          <FAQItem
            value="item-2"
            question="What data formats does Intellicharts support?"
            answer="Intellicharts accepts virtually any data format: JSON objects, CSV files, XML documents, HTML tables, Excel files, API responses, and even plain JavaScript objects. Our AI agent intelligently parses and understands the structure regardless of format."
          />
          <FAQItem
            value="item-3"
            question="What types of charts can I create?"
            answer="Intellicharts supports a wide variety of chart types including bar charts, line graphs, pie charts, scatter plots, heatmaps, area charts, bubble charts, and more. The AI automatically suggests the best chart type based on your data structure."
          />
          <FAQItem
            value="item-4"
            question="Can I customize the charts?"
            answer="Absolutely! Every chart is fully customizable. You can adjust colors, fonts, labels, legends, axes, and more. Use our intuitive interface or describe your preferences in natural language, and the AI will apply your customizations."
          />
          <FAQItem
            value="item-5"
            question="How do I export my charts?"
            answer="Charts can be exported in multiple formats: PNG for presentations, SVG for scalable graphics, or interactive HTML for embedding in websites. You can also copy the chart directly to your clipboard or download the underlying data."
          />
          <FAQItem
            value="item-6"
            question="Can Intellicharts connect to live data sources?"
            answer="Yes! Intellicharts can connect to REST APIs, webhooks, and other live data sources. Simply provide the endpoint URL, and our agent will fetch and visualize the data in real-time, with automatic refresh capabilities."
          />
          <FAQItem
            value="item-7"
            question="Is there an API or SDK available?"
            answer="Yes, we provide both a REST API and JavaScript SDK for developers who want to integrate Intellicharts into their applications. This allows you to programmatically generate charts from your data sources."
          />
        </Accordion>
      </div>
    </section>
  );
}
