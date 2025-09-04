---
title: 'Introducing AgenticNotebooks: Chat With Your Data While Keeping It Private'
date: '2025-05-16'
excerpt: "I'm launching the beta of AgenticNotebooks, a conversation-based notebook analysis tool that lets you chat with your Jupyter notebooks, Excel and CSV files while keeping your data completely private in your browser."
author:
  name: 'Priyansh Rastogi'
  image: '/images/blog/authors/priyansh.jpg'
coverImage: 'https://assets.agenticnotebooks.com/covers/blue-1.png'
tags: ['Announcement']
---

Hey there! After weeks of late nights, countless cups of coffee, and more notebook analysis than I care to remember, I'm beyond excited to invite you to try the beta version of AgenticNotebooks — a new tool that lets you chat with your notebooks and spreadsheets in plain English while keeping your data completely private.

## Why I Built This

I'll be honest — I've always found spreadsheets frustrating. Despite being a software engineer, I still Google basic Excel formulas every time I need them. And I'm not alone. Last year, at the fintech startup where I work, our product manager handed me a spreadsheet and asked me to update our database with the data. Just generating the SQL queries from that Excel file was an absolute nightmare that took me hours.

"There has to be a better way," I thought. "Why can't I just ask questions about my data and get exactly what I need?"

Like many of you, my first instinct was to try ChatGPT. I uploaded the spreadsheet and asked it to generate SQL insert statements. Here's what happened:

First, I realized my data had been uploaded to OpenAI's servers — not ideal for our sensitive financial information. Then ChatGPT started writing Python code to parse and analyze the file... except the code errored out. Three attempts later, it still wasn't working, and then I hit my "daily advanced analytics limit" without getting any actual SQL queries.

Even when I did get it to work on simpler datasets, crafting the perfect prompt felt like learning a new skill in itself. And downloading the processed data? Another headache entirely.

I knew there had to be a better solution. That's what led me to build AgenticNotebooks. As I started building, I focused on solving two key problems: making data analysis truly conversational and keeping your data private.

Most AI analysis tools require sending your entire dataset to their servers. For many businesses (including mine!), that's a complete non-starter when dealing with sensitive information.

So I challenged myself: Could I build something that offers the power of AI analysis without the prompt engineering frustration and without compromising data privacy?

## How AgenticNotebooks Works (The Privacy-First Way)

Here's where AgenticNotebooks gets interesting. When you upload a spreadsheet, your actual data stays right in your browser — it never leaves your computer. The only things I process on my servers are:

1. The structure of your spreadsheet (column names, data types)
2. Your questions about the data

The AI then generates JavaScript code that runs in your browser to analyze your actual data locally. It's like having a data analyst who can write code for you instantly, but who never actually sees your sensitive information.

This approach gives you the best of both worlds: powerful AI-assisted analysis with complete data privacy.

## What You Can Do With AgenticNotebooks

So what does this look like in practice? Imagine you've just uploaded your spreadsheet. Now you can simply ask:

"Which region had the highest sales growth last quarter?"

"Show me a chart of monthly revenue broken down by product category."

"What's our customer retention rate in Europe compared to North America?"

"Generate SQL INSERT statements for these customer records."

"Create UPDATE queries for all users who have a subscription status of 'expired'."

"Convert this product catalog to a valid JSON format."

You can even work with multiple files at once:

"Join customer data from customers.csv with orders.xlsx and show me which customers spent the most last month."

"Compare Q1 performance from q1_results.xlsx with Q2 data from q2_results.xlsx and visualize the trend."

No formulas to remember. No pivot tables to configure. No SQL to write manually. Just ask and get answers.

You can even transform your data through conversation:

"Create a new column showing profit margin for each sale."

"Filter out transactions under $500 and show me what's left."

"Clean up this data by removing rows with missing customer information."

And since all the processing happens in your browser, it's fast — no waiting for server processing or data uploads.

## The Technical Details (How It Actually Works)

For those curious about what's happening behind the scenes, here's a simplified look at how AgenticNotebooks works:

1. **Browser-Based Processing**: When you upload an Excel or CSV file, JavaScript in your browser processes the file entirely locally. No data is sent to any server.

2. **Metadata Extraction**: The system extracts only the structure of your data - column names, data types, and basic statistical information like unique and null counts. This metadata is a tiny fraction of your actual data size.

3. **AI Code Generation**: The metadata and your natural language query are sent to a specialized AI agent, which generates JavaScript code specifically designed to answer your question.

4. **Local Execution**: The generated JavaScript code is sent back to your browser and executed locally on your actual data. This code runs in a sandboxed environment for security.

5. **Results Rendering**: The results of the analysis are formatted in your browser - whether that's a table, a visualization, generated SQL, or something else.

What makes this approach unique is that the "heavy lifting" of data processing happens in your browser, not on distant servers. Your sensitive data values never leave your computer, while you still get the full power of AI-assisted analysis.

## It's Beta, and I'm Just Getting Started

I want to be upfront — this is a beta launch. You'll encounter some rough edges, and there are features I'm still working on. Currently, AgenticNotebooks supports:

- Excel files (.xlsx, .xls) and CSV files up to 30MB
- Finding insights using single or multiple files
- Basic and advanced statistical analysis
- Automatic generation of charts for data visualization
- Data filtering and transformation
- Text generation based on data (SQL/JSON generation)

I'm actively working on expanding these capabilities, adding support for larger files, enabling collaborative analysis, and building more advanced visualization options.

Your feedback during this beta will be invaluable in helping me refine the product and prioritize new features. I'm building this for you, after all!

## Try It Out (It's Free During Beta)

I'm offering AgenticNotebooks free during the beta period. I want as many people as possible to try it out and tell me what they think.

[Try AgenticNotebooks Beta →](https://AgenticNotebooks.com/new)

After you've given it a spin, please share your thoughts! What worked well? What was confusing? What features would make this indispensable for you? Your input will directly shape what AgenticNotebooks becomes.

It's not perfect yet, but I think it's already pretty useful, and with your help, it'll get even better.

---

Have questions or feedback? I'd love to hear from you personally. Reach out to me directly at priyansh@AgenticNotebooks.com. I'm building this for everyone who's ever been frustrated by spreadsheets and databases!
