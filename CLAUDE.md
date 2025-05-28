# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pitchy** is an AI-powered sales practice tool - a simplified MVP web application for practicing sales conversations with AI customer personas through voice interaction. The app requires no user accounts or authentication, providing immediate practice sessions with realistic AI-powered customer interactions.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linting checks
```

## Architecture & Data Flow

The application follows this core flow:
1. **Setup Phase**: User selects customer persona + scenario type
2. **Voice Interaction**: Real-time voice recording → OpenAI Whisper transcription → GPT-4 persona response → Browser TTS output
3. **Session End**: User terminates → GPT-4 generates feedback analysis → Display results with transcript

### Key Personas (lib/personas.js)
- **Skeptical Steve**: Price-focused, asks tough questions, needs proof points
- **Busy Betty**: Time-pressed, wants quick answers, fast decision-maker  
- **Technical Tom**: Spec-focused, asks detailed technical questions

### Scenarios (lib/scenarios.js)
- **Cold Call**: First contact, introduction focused
- **Product Demo**: Feature presentation, benefit-focused
- **Objection Handling**: Address customer concerns and doubts

## Technical Architecture

**Frontend**: Single-page React/Next.js app with TypeScript and state management for session flow
**Backend**: Next.js API routes with TypeScript handling OpenAI integrations
**Language**: TypeScript throughout - all files should use .ts/.tsx extensions
**AI Integration**: 
- GPT-4 for conversation and feedback generation
- Whisper for speech-to-text transcription
- Browser Web Speech API for text-to-speech output
**Storage**: Browser localStorage only (no database)
**Deployment**: Vercel free tier

## Environment Requirements

Required environment variable:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Implementation Status

The project is in early development phase:
- ✅ Project setup, dependencies, and core data structures complete
- ⏳ All React components, API routes, and main application logic pending implementation
- 📋 See TODO.txt for detailed implementation roadmap

## Key Implementation Notes

- Conversation prompts use persona-specific system messages with scenario context for realistic AI behavior
- Audio recording uses MediaRecorder API with hold-to-talk interaction pattern
- Session feedback analyzes entire conversation transcript against persona/scenario objectives
- No user persistence - each session is independent and ephemeral