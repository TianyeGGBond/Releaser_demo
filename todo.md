# AI-Powered Internal Developer Platform - TODO

## Core Platform
- [x] Plugin architecture with dynamic loading and registration system
- [x] Core platform dashboard with sidebar navigation
- [x] Plugin management interface (enable/disable/configure)
- [x] Dark theme developer-focused design
- [x] Global theming and index.css setup

## Plugins
- [x] Service Catalog plugin - display and manage microservices/components
- [x] AI Assistant plugin - analyze deployment logs and troubleshoot errors via LLM
- [x] Onboarding Workflow plugin - scaffolding templates for new projects
- [x] Developer Productivity Metrics plugin - DORA/SPACE framework dashboard
- [x] Plugin Marketplace UI - discover and enable plugins
- [x] Deployment Monitor plugin - real-time deployment status across services

## Backend
- [x] Database schema for plugins, services, deployments, onboarding templates
- [x] tRPC routers for plugin management
- [x] tRPC routers for service catalog CRUD
- [x] tRPC routers for AI assistant (LLM integration)
- [x] tRPC routers for onboarding workflows
- [x] tRPC routers for metrics data
- [x] tRPC routers for deployment monitoring
- [x] Seed data for demo services and deployments

## Testing
- [x] Vitest tests for plugin management
- [x] Vitest tests for service catalog
- [x] Vitest tests for deployments, metrics, templates, auth (18 total)
