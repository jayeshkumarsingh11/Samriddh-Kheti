
# Samriddh Kheti: Your AI-Powered Farming Assistant.

![Samriddh Kheti](https://khetibuddy.com/wp-content/uploads/2024/06/Crops.jpg)

**Samriddh Kheti** (meaning *Prosperous Farming*) is a multilingual, AI-driven web application designed to be a modern farmer's most trusted digital companion. By providing a suite of powerful, easy-to-use tools, we deliver personalized, data-driven insights to revolutionize agricultural practices in India.

## 1. The Problem

Indian farmers grapple with a complex set of challenges: unpredictable weather, inefficient water management, limited access to fair market pricing, and low awareness of beneficial government support schemes. This information gap leads to diminished crop yields, financial uncertainty, and wasted resources, ultimately impacting farmer livelihoods and the nation's food security.

## 2. Our Solution

Samriddh Kheti addresses these challenges by closing the information gap. Our platform empowers farmers to make informed, strategic decisions by analyzing farm-specific inputs (like location and soil type) alongside real-time weather and market data. We aim to make sophisticated agricultural insights accessible and understandable to every farmer, regardless of digital literacy or language.

## 3. Key Features

Our platform is built around a core set of features designed to address the key pain points of modern farming:

*   **🧠 AI Crop Advisor**: Get personalized crop recommendations based on your farm's location, soil type, water availability, and your primary goal (e.g., maximizing profit, drought resistance).
*   **💧 Smart Irrigation Planner**: Receive an optimal irrigation schedule based on your crop type, location, and real-time weather data to conserve water and prevent crop stress.
*   **🔬 Soil Quality Advisor**: Improve your soil's long-term health with actionable advice on crop rotation, organic fertilizers, and more, based on your cultivation history.
*   **🏦 Government Scheme Finder**: Easily discover and understand relevant government subsidies and support programs you are eligible for, with details on benefits and how to apply.
*   **📈 Interactive Dashboard**: A central hub providing a real-time overview of local weather forecasts, crop price comparisons (MSP vs. Local Market), and AI-powered price trend analysis.
*   **🌐 Multilingual Support**: The entire platform is available in multiple Indian languages, ensuring accessibility for farmers across different regions.

## 4. Technology Stack

Samriddh Kheti is built with a modern, robust, and scalable technology stack:

*   **Frontend**: [Next.js](https://nextjs.org/) (with App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI**: [Google's Gemini models](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit), Google's open-source GenAI framework.
*   **Deployment**: Hosted on [Vercel]

## 5. Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/jayeshkumarsingh11/Samriddh-Kheti.git
    cd samriddh-kheti
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google AI API key:
    ```.env
    GEMINI_API_KEY=YOUR_API_KEY
    ```
    You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    The application requires two development servers to run concurrently: one for the Next.js frontend and one for the Genkit AI flows.

    *   **In your first terminal, run the Genkit server:**
        ```sh
        npm run genkit:watch
        ```
        This will start the local server for your AI flows and watch for any changes.

    *   **In a second terminal, run the Next.js frontend server:**
        ```sh
        npm run dev
        ```

5.  **Open the application:**
    Open [https://samriddh-kheti.vercel.app/](https://samriddh-kheti.vercel.app/) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.

## 6. Our Team

Samriddh Kheti was proudly developed by **Team MythBusters**:

*   **Aditya Adarsh**
*   **Jayesh Kumar Singh**
*   **Lavish Patel**
*   **Vidushi Srivastava**

---

We believe that by putting the right tools in the hands of our farmers, we can cultivate a more prosperous and sustainable future for Indian agriculture.
