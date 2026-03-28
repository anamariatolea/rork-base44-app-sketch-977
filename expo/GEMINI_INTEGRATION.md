# Google Gemini Integration

This project integrates Google Gemini AI for intelligent image analysis in the Memories feature.

## Features

### 1. **Automatic Image Analysis**
When users upload or take a photo, the app automatically:
- Generates a romantic caption
- Provides a detailed description
- Detects the mood/emotion
- Suggests relevant tags
- Identifies the type of relationship moment

### 2. **AI Insights**
Users can tap on any memory to:
- View detailed AI-generated information
- Get personalized insights about their memory
- Receive suggestions on how to commemorate the moment

## Setup

### 1. Environment Variables
The project uses a `.env` file to store the Google Gemini API key securely.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Gemini API key:
   ```
   EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 2. Get Your API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## Usage

### In the Memories Tab:
1. **Upload Photo**: Tap "Upload Photo" to select from gallery
2. **Take Photo**: Tap "Take Photo" to capture a new memory
3. **View Details**: Tap any memory card to see full details
4. **Get Insights**: In detail view, tap "Get AI Insight" for personalized analysis

## Technical Implementation

### Files Created/Modified:
- `constants/gemini.ts` - Gemini API integration utilities
- `app/(tabs)/memories.tsx` - Enhanced with AI features
- `.env` - Environment variables (not committed to git)
- `.env.example` - Template for environment variables
- `.gitignore` - Ensures `.env` is not committed

### Key Functions:

**`analyzeImage(imageUri: string)`**
- Analyzes uploaded images using Gemini 1.5 Flash
- Returns structured data with caption, description, mood, tags, and moment type

**`scanMemoryForInsights(imageUri: string)`**
- Provides deeper insights about relationship moments
- Generates personalized suggestions and observations

## Security Notes

- The `.env` file is excluded from git via `.gitignore`
- API keys are loaded via `process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY`
- Never commit your actual API key to version control
- When cloning this repo, copy `.env.example` to `.env` and add your own key

## Dependencies

- `@google/generative-ai` - Official Google Generative AI SDK
- `expo-file-system` - For handling local files and image conversion
- `expo-image-picker` - For selecting/capturing images
- `@tanstack/react-query` - For managing async mutations

## API Usage

The integration uses:
- **Model**: `gemini-1.5-flash`
- **Features**: Vision + Text generation
- **Format**: JSON responses for structured data

## Future Enhancements

Potential improvements:
- Batch analysis for multiple photos
- Memory timeline visualization
- Relationship insights dashboard
- Export memories as photo books
- Share memories with partner
