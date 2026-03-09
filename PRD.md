# Product Requirements Document

## Project Cognito (Advanced Link Engine)

### 1. Executive Summary

Cognito is a high-performance, edge-routed URL shortener and link management platform. The system provides users with the ability to generate short links, claim custom aliases, generate QR codes, and track click analytics in real time. Built on a modern serverless stack, Cognito emphasizes low latency redirection, strict data validation, and an intuitive user interface.

### 2. Objectives and Goals

- Deliver sub-millisecond URL redirections by leveraging edge caching.
- Provide a secure, validated input mechanism for creating short links and custom aliases.
- Offer an analytical dashboard for users to monitor link engagement (total links, total clicks).
- Ensure high availability and fault tolerance through distributed database and caching layers.

### 3. Target Audience

- Digital marketers requiring trackable, short outbound links.
- Content creators needing custom, branded aliases and QR codes for physical or digital distribution.
- Enterprises requiring a reliable link management system with edge performance.

### 4. Technical Specifications

#### 4.1 Architecture Stack

- **Frontend Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL) for persistent storage of URLs and click event data
- **Caching Layer:** Upstash Redis for high-speed, edge-based URL resolution and redirection
- **Validation:** Zod for strict schema enforced input validation
- **UI Components:** Lucide React for iconography, Recharts for analytical data visualization, QRCode.react for dynamic QR generation

#### 4.2 Core Features

- **URL Shortening Engine:** Converts arbitrary long URLs into a secure, 6-character randomized short code.
- **Custom Aliasing:** Allows users to define custom string aliases, validated against a strict alphanumeric regex, with collision detection against the PostgreSQL database.
- **Edge Routing:** Resolves short codes to original URLs at the edge using Redis, falling back to PostgreSQL only on cache misses, minimizing redirect latency.
- **QR Code Generation:** Automatically generates a standard, high-quality QR code for every shortened URL, enabling seamless offline-to-online workflows.
- **Analytical Dashboard:** A dedicated interface displaying aggregate metrics (total links, total clicks) and providing a granular view of all generated links.
- **Clipboard Integration:** One-click copy functionality leveraging the browser Clipboard API.

### 5. Functional Requirements

- **Input Validation:** The system must validate all incoming URLs to ensure proper formatting and security constraints using Zod schemas. Custom aliases must be between 3 and 30 characters, utilizing only alphanumeric characters and hyphens.
- **Collision Handling:** The system must reject duplicate custom aliases and gracefully prompt the user to select an alternative.
- **Redirection Logic:** The routing mechanism must perform a 301 or 302 redirect by querying the Redis cache. If the key is missing, it must query the Supabase database, update the cache, and then redirect.
- **Click Tracking:** Every successful redirect must asynchronously log a click event in the Supabase database connected to the parent short code.
- **Dashboard Updates:** The dashboard must fetch live data directly from the database and enforce strict cache invalidation to ensure statistics remain accurate.

### 6. Non-Functional Requirements

- **Performance:** URL redirection should occur in under 50ms at the edge.
- **Security:** All database interactions must be securely handled server-side using Next.js Server Actions to prevent exposure of database credentials.
- **Scalability:** The architecture must scale horizontally, handling sudden traffic spikes without degraded redirection performance.
- **User Experience:** The interface must be responsive, accessible, and provide immediate visual feedback for all asynchronous operations (loading states, error handling, success confirmations).

### 7. Future Enhancements

- User authentication and role-based access control.
- Granular analytics (geolocation, device type, referrer tracking).
- Link expiration and password protection features.
- Custom domain support for enterprise clients.
