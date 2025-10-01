# Project Setup

This project uses Azure OpenAI and Weather API services. Follow the instructions below to get started.

## Prerequisites

- Node.js installed on your system
- Azure OpenAI account and API credentials
- Weather API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see below)

## Environment Configuration

Create a `.env` file in the root directory of the project with the following keys:

```env
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
DEPLOYMENT_NAME=
API_VERSION=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_INSTANCE_NAME=
WEATHER_API_KEY=
```

### Getting Your API Keys

**Azure OpenAI:**
- Sign up for Azure OpenAI service
- Create a deployment and note the deployment name
- Get your API endpoint and key from the Azure portal

**Weather API:**
- Sign up at your preferred weather API provider
- Generate an API key from your dashboard

**Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

## Running the Project

```bash
npm start
```

## Project Structure

- `chat.js` - Main chat functionality
- `chatbot.js` - Chatbot implementation
- `chatbot-langchain.js` - LangChain integration
- `langchain1.js` through `langchain6.js` - Various LangChain examples
- `notes.js` - Notes functionality
- `weather.js` - Weather API integration

## Contributing

Please ensure all sensitive information is stored in the `.env` file and never committed to the repository.
