# Build Buddy AI - System Functionalities Overview

## Purpose

This document summarizes the main features and user-facing functionalities of the Build Buddy AI system in one place. It is meant to be the handoff document for stakeholders, reviewers, or anyone who needs a quick but complete view of the product.

## 1) Public Site Features

- Landing page with feature sections, pricing, solutions, and resources navigation.
- Responsive desktop and mobile navigation with dropdowns and collapsible menus.
- Search page for discovering engineers, architects, contractors, and suppliers.
- Free browsing mode with a login prompt for full access.
- Solutions page that explains the platform by user role and use case.

## 2) Authentication And Account Management

- User registration and login.
- Email verification flow.
- Two-factor verification flow.
- Forgot password and reset password flows.
- Protected route handling for authenticated areas.
- Terms and conditions page.

## 3) User Dashboard Features

- Dashboard home with project and activity overview.
- Project management with project list, project details, and status tracking.
- Analytics and reporting pages.
- Tasks, documents, team, notifications, settings, support, credits, and customer journey pages.
- Professional search inside the dashboard.
- Messages and profile management.
- Community hub access from the user dashboard.

## 4) Community Features

- Community feed with state persistence for bookmarks, follows, votes, poll votes, and chat messages.
- Community comments, activity feed, and unread activity handling.
- Community chat and live room features.
- Live session presence, access control, recordings, transcripts, and archive support.
- Post reporting, moderation actions, pinning, and admin approval controls.

## 5) Engineer Panel

- Engineer home dashboard.
- Inbox and notifications.
- Projects and portfolio views.
- Analytics, profile, settings, and support pages.

## 6) Specialized Role Portals

- Role-based portal home.
- Inbox, notifications, portfolio, tasks, marketplace, and network views.
- Profile, settings, and support pages.
- Access restricted to the configured specialized portal roles.

## 7) Admin Panel

- Admin overview dashboard.
- User management.
- Project management.
- Subscriptions, content, logs, AI, credits, journey, and settings pages.
- Assistant limit controls for admin oversight.

## 8) Backend And API Capabilities

- Health and database health checks.
- Authentication endpoints for register, login, logout, email verification, 2FA, and password reset.
- Public engineer search API.
- Inquiry creation, inbox, sent items, read tracking, replies, and updates.
- AI project draft generation, project update processing, assistant conversation history, and assistant chat endpoints.
- Community feed, state, analytics, bookmarks, follows, votes, polls, chat, activity, and live room APIs.
- Team member management and notification reminder settings.
- Prisma-backed PostgreSQL data storage and platform settings persistence.
- Automated inquiry notification and reply email delivery.

## 9) Shared Platform Capabilities

- Theme support.
- Language support.
- Responsive layouts across desktop, tablet, and mobile.
- Role-based routing and access control.
- Toast notifications and optimistic UI patterns where applicable.
- React Query for client-side data fetching and caching.

## Recommended Handoff Filename

- `SYSTEM_FUNCTIONALITIES_OVERVIEW.md`

## Best For

- Stakeholders who want a single summary of the product.
- Developers who need a fast map of the system surface.
- Anyone receiving the project documentation for review or handoff.