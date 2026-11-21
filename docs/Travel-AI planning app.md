**Project Name:** AI-Powered Travel Planning & Aggregator Platform (Vietnam-First Edition) 

**Project Type:** Full-Stack Web Application

**Architecture Model:** Third-Party Aggregator & Affiliate Redirect (No internal booking engine)

### **1\. Executive Summary**

This project is an advanced, AI-driven travel planning workspace designed to eliminate the friction of organizing group trips, built specifically with the Vietnamese market in mind. Operating as a high-performance aggregator rather than a traditional OTA, it leverages Large Language Models (LLMs) to generate dynamic, hyper-localized itineraries. The system utilizes Java 21 Virtual Threads to execute real-time, concurrent API calls to fetch live travel data (weather, flights, places), and provides a collaborative drag-and-drop map interface for users to refine their plans. Final bookings are handled by redirecting users to external third-party providers.

### **2\. Core Objectives**

* **Hyper-Localized AI Planning:** Utilize AI to translate natural language constraints into structured, map-based travel itineraries, optimized for Vietnamese context (e.g., local transit, VND budgets, local culinary preferences).  
* **High-Throughput Concurrency:** Leverage modern Java concurrency to handle simultaneous third-party API calls, drastically reducing load times.  
* **Real-time Collaboration:** Enable multiple users to interact with a single itinerary workspace simultaneously via WebSockets without data conflicts.  
* **System Resilience & Caching:** Protect the application from third-party API rate limits and long AI generation wait times using message queues (RabbitMQ) and in-memory data stores (Redis).

### **3\. Technology Stack**

**Frontend (Client-Side)**

* **Framework:** React 18+ (with Next.js or Vite)  
* **Language:** TypeScript (Strict typing for complex itinerary state)  
* **State Management:** Zustand or Redux Toolkit (To manage the Drag-and-Drop board state)  
* **Real-time Communication:** Socket.io-client (For collaborative editing)  
* **Localization:** react-i18next (For multi-language support, defaulting to Vietnamese)  
* **Styling & UI:** Tailwind CSS \+ Shadcn UI or Material-UI  
* **Mapping & Interactions:** Mapbox GL JS (Centered on Vietnam by default) \+ React DnD (Drag-and-drop timeline)

**Backend (Server-Side)**

* **Framework:** Spring Boot v4.1.1  
* **Language:** Java 21 (Utilizing Virtual Threads / Project Loom for high-throughput concurrency)  
* **Concurrency & API Gateway:** CompletableFuture combined with Java Virtual Threads for non-blocking, concurrent HTTP requests to third-party APIs.  
* **Real-time Server:** Spring WebSockets with STOMP protocol  
* **Background Jobs & Messaging:** Spring AMQP integrating with RabbitMQ (To handle AI generation and PDF exports asynchronously)  
* **Security:** Spring Security with OAuth2 Client (Google/Facebook login) and custom JWT session management

**Database & Storage**

* **Primary Database:** PostgreSQL  
  * *Customization:* Utilizing `unaccent` and `pg_trgm` extensions to support highly accurate, typo-tolerant full-text search for Vietnamese locations (e.g., matching "Da Lat" with "Đà Lạt").  
* **ORM:** Spring Data JPA / Hibernate (For robust entity mapping and database transactions)  
* **In-Memory Store / Cache:** Redis (Integrated via Spring Data Redis & `@Cacheable` for instant API rate-limit caching)  
* **File Storage:** AWS S3 (Using AWS SDK for Java to store generated PDF itineraries)

**Third-Party APIs & AI Integrations**

* **AI Engine:** OpenAI API (GPT-4o) or Google Gemini API  
  * *Prompt Engineering:* Strict system prompts enforcing Vietnamese language, local transportation routing (sleeper buses, Grab), and VND currency constraints.  
* **Travel Data Aggregation:** Amadeus API, Skyscanner API, or RapidAPI alternatives  
* **Location & Weather:** Google Places API / Yelp API \+ [OpenWeather API](https://openweathermap.org/api)  
  * *Region Biasing:* API requests strictly localized with `language=vi&region=vn` to prioritize domestic Vietnamese data.  
  * *Weather Data:* Utilizing OpenWeather's daily forecast and probability of precipitation (POP) endpoints.

**DevOps & Deployment**

* **Containerization:** Docker & Docker Compose (To easily run Postgres, Redis, RabbitMQ, and Spring Boot locally)  
* **Hosting:** Render / Railway (Backend) \+ Vercel (Frontend)  
* **CI/CD:** GitHub Actions (Automated testing and deployment pipeline)

### **Application Features & Architecture**

**Core CRUD & Must-Have Features** **1\. User Authentication & Profile Management:** Provide a secure system for users to sign up, log in, manage their personal travel preferences, and view their past or upcoming saved trips. *Technical Implementation:* Implement OAuth 2.0 for quick social logins (Google/Facebook). Use JWT (JSON Web Tokens) combined with HTTP-only Refresh Tokens for secure session management. Use a relational database (PostgreSQL) to handle the User \-\> Trips relationships.

**2\. Itinerary Workspace Management (The Core CRUD):** The foundational ability for users to manually create a new trip board, add days to the trip, edit location names, and delete entire itineraries if they cancel their plans. *Technical Implementation:* Build standard RESTful APIs (GET, POST, PUT, DELETE) linked to your main database. Ensure proper data validation and error handling so users can only modify trips they own.

**3\. Live "Quỹ Nhóm" (Group Fund) & Auto-Splitter:** Integrate real-time expense tracking directly into the drag-and-drop itinerary. Users can log who paid for specific timeline items. At the end of the trip, the app calculates exact debts and automatically generates payment gateway links (such as VNPAY or VietQR) for instant settlement. *Technical Implementation:* Use PostgreSQL for ACID-compliant transaction logging of shared expenses. Cache the running balance in Redis so the "Total Owed" updates instantly via WebSockets across all clients without hitting the primary database.

**AI-Powered Features** **1\. Individual Natural Language Interface (LUI) Concierge:** Instead of a cluttered group chat, provide a private, chat-based assistant for each user to mediate planning. An individual can privately query the AI (e.g., "Find lunch spots under 50k VND"). The AI acts as a researcher, and when the user accepts a suggestion, it instantly syncs to the shared visual board for the group. *Technical Implementation:* Integrate LLMs (Gemini API/OpenAI) for intent recognition and entity extraction. Use WebSockets for real-time streaming to the individual user, and publish accepted itinerary events to the group's shared board state.

**2\. RAG-Powered Dynamic Itinerary Generator:** Allows users to input a complex, hyper-specific prompt (e.g., "5 days in Tokyo for a couple, we love street food, hate crowds, and need wheelchair accessibility"). The system bypasses generic lists and generates a day-by-day, mapped-out schedule that accounts for transit times and seasonal weather. *Technical Implementation:* Use Retrieval-Augmented Generation (RAG). Store your travel data (places, hours, coordinates) in a Vector Database (like Pinecone or Qdrant). When the user prompts, query the vector DB for context, feed it to the LLM, and strictly format the output as JSON to plot markers automatically on a Mapbox/Google Maps interactive UI.

**3\. NLP Review Summarization & Sentiment Analysis:** Instead of forcing users to scroll through hundreds of scattered hotel reviews, use AI to aggregate and summarize them instantly. The UI displays a bite-sized, categorized summary: "Guests praise the rooftop pool but consistently complain about slow Wi-Fi and street noise." *Technical Implementation:* Set up an asynchronous background job pipeline (using Message Queues like RabbitMQ or Redis BullMQ) so the heavy text processing doesn't block your main server thread. Cache the generated summaries in Redis to ensure instantaneous delivery for the next user querying the same hotel.

**4\. Weather-Aware Timeline & "Plan B" Routing:** The itinerary dashboard visually displays the expected weather and temperature for each specific day directly on the timeline headers. The system continuously evaluates the feasibility of the dragged timeline activities against this forecast. If a user drops an outdoor activity onto a day where the probability of precipitation (POP) is high, the UI instantly flashes a rain warning badge and offers a 1-click "Suggest Plan B" to swap the event for a nearby indoor alternative. *Technical Implementation:* Utilize Java 21 Virtual Threads to concurrently fetch Mapbox transit times and OpenWeather's daily probability of precipitation (POP) data. Offload the heavy LLM recalculation to RabbitMQ to keep the collaborative board instantly responsive, pushing the newly generated indoor route back via WebSockets once ready.

**High-Performance & System Architecture Features** **1\. Concurrent Third-Party API Aggregation (Scatter-Gather Pattern):** When generating a trip dashboard, the app must fetch live weather, estimated flight costs, and top restaurant ratings from external providers simultaneously without making the user wait 15 seconds. *Technical Implementation:* Act as an API Gateway. Use asynchronous backend programming (CompletableFuture with Java Virtual Threads) to fire 4-5 external HTTP requests at the exact same time, await the slowest one, and bundle the responses into a single, clean JSON payload for the frontend.

**2\. Asynchronous Background Processing & Export:** Handle heavy, time-consuming tasks—like waiting for the AI to generate a 7-day trip or rendering a visually heavy PDF of the itinerary—without blocking the server or timing out the user's browser. *Technical Implementation:* Implement a Message Queue (RabbitMQ). The main backend immediately returns a 202 Accepted status to the frontend, pushing the heavy task to a separate Worker Server. Once finished, the worker uses SendGrid/Mailtrap to email the PDF and updates the UI via WebSockets.

**3\. Aggressive Caching & Rate-Limit Protection:** Prevent the application from crashing due to external API limits (e.g., weather or flight APIs) and drastically speed up load times for popular search queries. *Technical Implementation:* Integrate Redis (In-Memory Data Store). When a user searches for "Things to do in Paris," check Redis first. If it exists, serve it in milliseconds. If not, call the external API and save the response in Redis with a 10-minute TTL (Time-To-Live).

**Advanced Frontend & Interactive UI Features** **4\. Collaborative Real-Time Drag-and-Drop Map Board:** Create an interactive workspace where multiple users can plan a trip together. If User A drags a restaurant from Day 1 to Day 2, User B sees the change instantly, and the map automatically redraws the route. *Technical Implementation:* Use WebSockets (Socket.io) or Server-Sent Events (SSE) for real-time data syncing across clients. Implement React DnD (Drag and Drop) for the timeline UI. Integrate Mapbox SDK or Google Maps API for dynamic routing. Use Optimistic UI updates (via Zustand or Redux) to make interactions feel perfectly instant.

