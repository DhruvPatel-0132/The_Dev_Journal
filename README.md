# Multi-User Engineering Blog Platform

> A production-grade, role-based engineering publishing platform built with Next.js, TypeScript, Node.js, and modern software architecture principles.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success)

---

# Table of Contents

* Overview
* Problem Statement
* Project Goals
* Key Features
* System Architecture
* Architecture Decisions
* Technology Stack
* Application Modules
* User Roles & Permissions
* Authentication Flow
* Database Design
* API Architecture
* Frontend Architecture
* State Management Strategy
* SEO Strategy
* Security Implementation
* Performance Optimizations
* PDF Export Engine
* Project Structure
* Environment Variables
* Local Development Setup
* Deployment Strategy
* Future Enhancements
* Learning Outcomes

---

# Overview

Multi-User Engineering Blog Platform is a full-stack publishing system designed specifically for technical content creators.

The platform enables developers, engineers, and technical writers to create rich content, publish SEO-optimized articles, manage content through a dedicated dashboard, and distribute articles in both web and PDF formats.

Unlike traditional CRUD applications, this project focuses heavily on modern engineering practices including:

* Scalable Architecture
* Role-Based Access Control
* SEO Optimization
* Authentication Security
* State Management
* Performance Optimization
* Production Deployment Readiness

---

# Problem Statement

Most beginner blogging projects focus only on CRUD functionality.

Real-world platforms require:

* Authentication
* Authorization
* SEO
* Rich Text Editing
* Protected Routes
* Data Ownership Validation
* Caching Strategies
* PDF Generation
* Scalable Folder Structures

This project addresses those challenges by implementing an enterprise-inspired architecture.

---

# Project Goals

The primary objective of this project is to simulate a production software environment where developers gain practical experience with:

* Full Stack Development
* API Design
* Authentication Systems
* Authorization Layers
* Database Modeling
* SEO Engineering
* State Management
* Software Architecture
* Deployment Workflows

---

# Key Features

## Authentication System

### Credential Authentication

* Secure registration
* Secure login
* Password hashing using bcrypt/argon2
* JWT-based authorization

### OAuth Authentication

* Google OAuth Redirect Flow
* Google OAuth Popup Flow
* Social account onboarding

### Authorization

Role-Based Access Control (RBAC)

Supported Roles:

```text
VISITOR
CREATOR
```

---

## Content Management System

Creators can:

* Create Articles
* Edit Articles
* Delete Articles
* Publish Articles
* Unpublish Articles
* Export Articles as PDF

Each article supports:

* Title
* SEO Slug
* Featured Cover Image
* Rich Content
* Categories
* SEO Keywords
* Excerpts
* Publication Status

---

# System Architecture

```text
┌─────────────────────────────────┐
│           Client Layer          │
│         Next.js Frontend        │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│         API Gateway Layer       │
│         Express Backend         │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│        Database Layer           │
│      MongoDB / PostgreSQL       │
└─────────────────────────────────┘
```

Frontend and backend are fully decoupled.

This architecture enables:

* Independent deployments
* Scalability
* Maintainability
* Service separation

---

# Architecture Decisions

## Why Next.js?

* Server Components
* SEO Support
* Route Groups
* Metadata APIs
* Better Performance

## Why TanStack Query?

Server state and API data require:

* Caching
* Automatic Refetching
* Optimistic Updates
* Mutation Handling

TanStack Query solves these problems efficiently.

## Why Zustand?

UI state should remain lightweight.

Zustand provides:

* Minimal Boilerplate
* High Performance
* Persistent Storage Support

## Why Express?

* Lightweight
* Flexible
* Large Ecosystem
* Industry Adoption

---

# Technology Stack

## Frontend

| Technology      | Purpose            |
| --------------- | ------------------ |
| Next.js 14      | Frontend Framework |
| TypeScript      | Type Safety        |
| Tailwind CSS    | Styling            |
| shadcn/ui       | UI Components      |
| TanStack Query  | Server State       |
| Zustand         | Client State       |
| React Hook Form | Forms              |
| Zod             | Validation         |

---

## Backend

| Technology | Purpose           |
| ---------- | ----------------- |
| Node.js    | Runtime           |
| Express.js | API Server        |
| JWT        | Authentication    |
| bcrypt     | Password Security |
| TypeScript | Type Safety       |

---

## Database

### Option 1

MongoDB + Mongoose

### Option 2

PostgreSQL + Prisma

---

# User Roles & Permissions

| Action           | Visitor | Creator |
| ---------------- | ------- | ------- |
| View Feed        | ✅       | ✅       |
| Read Articles    | ✅       | ✅       |
| Create Articles  | ❌       | ✅       |
| Edit Articles    | ❌       | ✅       |
| Delete Articles  | ❌       | ✅       |
| Publish Articles | ❌       | ✅       |
| Dashboard Access | ❌       | ✅       |

---

# Authentication Flow

```text
User Login
    │
    ▼
Auth.js
    │
    ▼
Backend Verification
    │
    ▼
JWT Generation
    │
    ▼
Role Detection
    │
    ▼
Route Redirection
```

### Redirect Logic

```text
VISITOR
   └── /

CREATOR
   └── /dashboard/articles
```

---

# Database Design

## User Schema

```ts
{
  _id: ObjectId,
  name: string,
  email: string,
  passwordHash: string,
  role: "VISITOR" | "CREATOR",
  createdAt: Date
}
```

## Blog Schema

```ts
{
  _id: ObjectId,
  title: string,
  slug: string,
  htmlContent: string,
  category: string,
  coverImage: string,
  excerpt: string,
  seoKeywords: string[],
  status: "DRAFT" | "PUBLISHED",
  authorId: ObjectId,
  createdAt: Date
}
```

---

# API Architecture

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
GET  /api/auth/profile
```

## Articles

```http
GET    /api/posts
GET    /api/posts/:slug
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
PATCH  /api/posts/:id/status
```

---

# SEO Strategy

Implemented Features:

* Dynamic Metadata
* Open Graph Tags
* Twitter Cards
* SEO Slugs
* Canonical URLs
* Meta Descriptions
* Structured Data
* Sitemap Generation
* Robots Configuration

Example:

```text
/blog/nextjs-state-management-best-practices
```

---

# Security Implementation

## Authentication Security

* JWT Tokens
* Password Hashing
* OAuth Validation

## Authorization Security

* RBAC
* Route Guards
* Middleware Protection

## API Security

* Request Validation
* Input Sanitization
* Rate Limiting
* Ownership Verification

## Data Security

* Protected Environment Variables
* Secure Password Storage
* Access Restrictions

---

# Performance Optimizations

### Frontend

* React Server Components
* Lazy Loading
* Dynamic Imports
* Image Optimization
* Route Splitting

### Backend

* Query Optimization
* Indexed Fields
* Lean Queries
* Pagination

### Caching

* TanStack Query Cache
* Request Deduplication
* Background Refetching

---

# PDF Export Engine

Built using:

```bash
@react-pdf/renderer
```

Features:

* Professional Layout
* Repeating Headers
* Repeating Footers
* Page Numbers
* Multi-Page Support
* Print-Friendly Styling

---

# Project Structure

```bash
frontend/
backend/
docs/
public/
```

Detailed architecture follows Domain Driven Design principles with clear separation between:

* UI Layer
* Business Layer
* Data Layer
* Infrastructure Layer

---

# Environment Variables

## Backend

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=
AUTH_SECRET=
AUTH_URL=
```

---

# Local Development Setup

```bash
git clone <repository-url>

cd frontend
npm install

cd ../backend
npm install
```

Start Backend

```bash
npm run dev
```

Start Frontend

```bash
npm run dev
```

---

# Deployment Strategy

## Frontend

* Vercel

## Backend

* Railway
* Render
* AWS ECS

## Database

* MongoDB Atlas
* Neon PostgreSQL

CI/CD Pipeline:

```text
GitHub
   ↓
GitHub Actions
   ↓
Build & Test
   ↓
Deploy
```

---

# Future Enhancements

### Phase 2 Features

* Article Comments
* Article Likes
* User Following
* Bookmark System
* Reading History
* Notifications
* Admin Dashboard
* Analytics Dashboard
* Newsletter Integration
* AI Content Assistance

---

# Learning Outcomes

This project demonstrates practical experience with:

* Full Stack Engineering
* Software Architecture
* Authentication & Authorization
* REST API Design
* SEO Engineering
* State Management
* Database Modeling
* Security Best Practices
* Rich Text Processing
* PDF Generation
* Production Deployment

---

# Author

**Dhruv Patel**

Software Engineer focused on building scalable, production-grade web applications using modern JavaScript and TypeScript ecosystems.
