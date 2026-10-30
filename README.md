Hyperlocal Safety Network
Hackathon Submission | [Hackathon Name] | [Date]

Overview
This repository contains the hackathon prototype for a hyperlocal community safety network. The application enables residents of apartment complexes and neighborhoods to report local incidents (water outages, power failures, safety hazards) and provides a mechanism to consolidate duplicate reports into verified, actionable incidents.

The prototype was designed and built within a 24-hour window. It is a functional demonstration, not a production-ready system.

The Problem
Residents currently rely on fragmented channels such as WhatsApp groups or direct calls to property managers. These channels lack structure, visibility, and accountability.

Existing community applications have attempted to address this but consistently fail for two reasons:

Cold-start failure. A platform with no existing reports presents an empty interface. Users abandon it immediately. No users means no data, and no data means no users.

Noise accumulation. When fifteen residents independently report the same water outage, the platform displays fifteen separate entries. Administrators cannot distinguish one significant issue from fifteen minor ones.

The result is that reports are either never made or never acted upon.

The Solution
This prototype does not attempt to build a better reporting form. It builds a consolidation layer that transforms unstructured, duplicate submissions into verified incidents.

Core Mechanisms
Incident clustering. When a report is submitted, the system checks for existing unresolved incidents in the same category within a 200-meter radius and a 4-hour window. If a match is found, the report is merged into the parent incident and the verification count increases. If no match exists, a new incident is created.

Community verification. Residents can confirm that an incident is still occurring. This provides a lightweight trust signal without requiring identity verification.

Neighborhood health score. A single value (0–100) summarizes the current state of the neighborhood. It is calculated as follows:

text
Score = 100
      - (5 points per unresolved incident)
      - (10 additional points per incident unresolved for more than 24 hours)
Administrative resolution. A dashboard lists all unresolved incidents. Marking an incident as resolved removes it from the resident feed and immediately recalculates the health score.

Technology Stack
Component	Technology
Frontend	React with Vite
Backend	Supabase (PostgreSQL)
Clustering logic	Vanilla JavaScript (Haversine formula)
Styling	Tailwind CSS
Deployment	Vercel
Data Model
Two tables are used:

incidents: Consolidated parent incidents. Fields include identifier, category, coordinates, creation timestamp, resolution status, and verification count.

reports: Raw user submissions. Each report references the parent incident it was merged into.

Clustering Algorithm
The clustering function executes the following sequence:

Retrieve unresolved incidents in the same category created within the last four hours.

Compute the great-circle distance between the new report and each candidate using the Haversine formula.

If any candidate is within 200 meters, increment its verification count and associate the report with it.

Otherwise, create a new parent incident.

For the hackathon build, this logic runs on the client. Moving it to a server-side function is a defined production task.

Implemented Features
Feature	Status
Mobile-first Progressive Web Application	Complete
Geolocation-based incident reporting	Complete
Incident clustering (200m radius, 4-hour window)	Complete
Community verification via upvotes	Complete
Real-time resident incident feed	Complete
Neighborhood health score with visual indicator	Complete
Administrative dashboard with resolution controls	Complete
Seed data utility for demonstration	Complete
Setup Instructions
Prerequisites: Node.js version 18 or later, and a Supabase account.

1. Clone the repository.

bash
git clone [repository-url]
cd safety-net
2. Install dependencies.

bash
npm install
3. Configure environment variables.

Create a file named .env.local in the project root and enter vite url and anon keys:
4. Initialize the database.

Execute the SQL schema located at supabase/schema.sql within the Supabase SQL editor. This creates the required tables, enables row-level security, and configures real-time publication.

5. Start the development server.

bash
npm run dev
The application will be available at http://localhost:5173. Use the browser developer tools device emulation for the intended mobile experience.

Demonstration Assets
Asset	Location
Reporting interface screenshot	docs/screenshots/report.png
Resident feed screenshot	docs/screenshots/feed.png
Administrative dashboard screenshot	docs/screenshots/admin.png
Known Limitations
The following limitations are acknowledged for transparency:

Clustering executes on the client. This is suitable for demonstration but not for production, where server-side validation is required to prevent manipulation.

Verification relies on upvote counts without identity validation. The system is vulnerable to coordinated false reporting.

The health score formula is heuristic and has not been calibrated against real incident data.

The administrative interface lacks authentication and is publicly accessible in the current build.

These limitations define the production roadmap.

Team
Member	Role	Responsibilities
ARYAN SINGH SHEKHAWAT	Lead and Architect	Database schema, clustering algorithm, health score computation, technical integration
PRINCE VERMA	Full-Stack Developer	Real-time synchronization, seed data generation, verification workflow, submission pipeline
AMARTYA RANJAN BOSE AND AYUSH KUMAR	Interface and Presentation	User interface design, health score visualization, demonstration preparation