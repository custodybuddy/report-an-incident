# Overview
This repository contains a Vite-powered React 19 single-page application that guides users through documenting an incident and generates AI-assisted reports.

## Running instructions emphasize installing dependencies, supplying a Gemini API key, and starting the dev server locally.

## Tooling & Configuration
TypeScript compiler settings target modern browsers, enable React JSX transforms, and expose a @/* path alias for root-relative imports.

## Source Directory Structure
### Core Application Flow
src/App.tsx orchestrates the six-step reporting wizard: it renders structural components (header, navigation, footer), switches between step components, validates progress, and triggers AI summary generation plus export/print handlers once users reach the review step.

## Step metadata (titles, icons, and option lists for parties, children, jurisdictions) lives in src/constants.ts, keeping wizard configuration centralized.

## Shared Types
types.ts defines the shapes for evidence attachments, incident data, AI-generated report payloads, modal metadata, and allowable evidence categories, ensuring consistent typing across components, hooks, and services.

Components
The src/components/steps/ directory contains dedicated UI for each wizard stage, such as Step0Consent for legal acknowledgments and Step5Review for presenting AI output, personal notes, and export actions.

Shared UI elements (buttons, custom checkbox) and formatting utilities live under src/components/ui/, allowing reusable styling and behaviors across steps.

State Management
src/hooks/useIncidentState.ts encapsulates wizard state, including persisted local storage hydration, validation per step, dirty-state tracking, and evidence cleanup when resetting the flow.

Services & Data Access
src/services/geminiClient.ts centralizes Gemini API bootstrap, src/services/geminiPrompts/ contains the typed prompt builders and response schemas used across AI workflows, and src/services/evidenceAnalysis.ts focuses on media-specific handling for automated evidence reviews.

src/services/evidenceStore.ts abstracts IndexedDB (with an in-memory fallback) for storing evidence blobs, exposing helpers to save, fetch, and delete records individually or in batches.

Reporting Utilities
src/components/ui/utils/export.ts composes AI outputs and incident metadata into printable/exportable HTML, presenting styled report sections, evidence logs, and resource lists before launching a new window or print dialog.

Together, these modules deliver a multi-step incident reporting workflow that persists user input, interacts with Gemini for analysis, and generates polished exports.



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NCiWxVYkEIYAa6UWeanNl_LOyEFvW6D7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `  `
