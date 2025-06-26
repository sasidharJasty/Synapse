# 🧠✨ Synapse - AI-Powered Academic Assistant

Synapse is a comprehensive AI-powered web application designed to help students optimize their learning, mood, and time management using artificial intelligence. It goes beyond traditional note-taking apps to serve as a smart, emotionally aware productivity system for academic and personal growth.

## 🌟 Features

### 📊 Dashboard
- **Smart Overview**: Quick view of today's plan, mood tracker, flashcard streak, and upcoming tasks
- **Emotional Greeting**: AI-powered greetings that adapt to your mood and time of day
- **Progress Tracking**: Visual representation of your study progress and achievements

### 🧠 Smart Flashcards & Study
- **AI-Generated Content**: Create flashcards from any topic using Gemini AI
- **Interactive Study Mode**: Flip animations and progress tracking
- **Quiz Integration**: Automatic quiz generation with explanations
- **Audio Support**: Text-to-speech for accessibility

### 📆 AI Calendar Planner
- **Mood-Aware Scheduling**: AI builds schedules considering your current mood
- **Energy Optimization**: Factors in energy levels and study patterns
- **Smart Task Management**: Automatic task creation and time estimation
- **Real-time Updates**: Live schedule adjustments based on progress

### 🎯 Goal Breakdown
- **AI-Powered Decomposition**: Break big goals into manageable daily tasks
- **Time Estimation**: Smart time estimates for each task
- **Motivational Support**: Personalized quotes and encouragement
- **Progress Tracking**: Visual progress indicators and completion stats

### 💭 Mood Tracker
- **Multi-Modal Input**: Emoji selection, slider, and voice input
- **AI Analysis**: Personalized study suggestions based on mood
- **Trend Analysis**: Track mood patterns over time
- **Wellness Integration**: Study intensity adjustments based on emotional state

### 📝 Lecture Enhancer
- **Text Analysis**: Paste lecture content for AI-powered analysis
- **Key Point Extraction**: Automatic identification of important concepts
- **Question Generation**: AI suggests clarifying questions for teachers
- **Concept Mapping**: Visual organization of ideas and relationships
- **Voice Transcription**: Real-time lecture transcription

### 🤝 Peer Matching
- **Smart Matching**: AI matches students based on subjects and strengths
- **Icebreaker Generation**: AI-powered conversation starters
- **Study Partner Discovery**: Find compatible study partners
- **Chat Interface**: Built-in messaging system

### 🔊 Voice Interface
- **Natural Language Processing**: Speak naturally to control the app
- **Multi-Modal Interaction**: Voice input with text and audio output
- **Context Awareness**: Remembers conversation history
- **Customizable Settings**: Adjust speech rate, pitch, and volume

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **State Management**: Zustand with persistence
- **AI Integration**: Google Gemini AI (@google/generative-ai)
- **Voice Interface**: Web Speech API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studybudy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_GEMINI_API_KEY=your_gemini_api_key" > .env
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
studybudy/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.jsx
│   │   └── VoiceAssistant.jsx
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.jsx
│   │   ├── Flashcards.jsx
│   │   ├── Planner.jsx
│   │   ├── Goals.jsx
│   │   ├── MoodTracker.jsx
│   │   ├── LectureEnhancer.jsx
│   │   ├── PeerMatch.jsx
│   │   └── VoiceInterface.jsx
│   ├── store/              # State management
│   │   └── useStore.js
│   ├── lib/                # External service integrations
│   │   └── gemini.js
│   ├── utils/              # Utility functions
│   │   └── voiceInterface.js
│   ├── hooks/              # Custom React hooks
│   ├── App.jsx             # Main application component
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Synapse**: Purple gradient (#d946ef to #c026d3)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Components
- **Cards**: Glass-effect cards with hover animations
- **Buttons**: Gradient primary buttons with hover effects
- **Inputs**: Focused input fields with smooth transitions
- **Animations**: Framer Motion animations for smooth interactions

## 🔧 Configuration

### Voice Interface Settings
- **Speech Rate**: 0.5x to 2x
- **Pitch**: 0.5 to 2
- **Volume**: 0 to 1
- **Language**: English (US)

### AI Prompts
The app uses carefully crafted prompts for Gemini AI to ensure consistent, helpful responses across all features.

## 🌐 Browser Support

- Chrome (recommended for voice features)
- Firefox
- Safari
- Edge

**Note**: Voice features require HTTPS in production and may not work in all browsers.

## 📱 Responsive Design

The app is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Privacy & Security

- All data is stored locally using browser storage
- No personal data is sent to external servers except for AI processing
- Voice data is processed locally when possible
- API keys are stored securely in environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Other Platforms
The app can be deployed to any static hosting platform that supports React applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **Tailwind CSS** for the beautiful design system
- **React Community** for the amazing ecosystem
- **Lucide** for the beautiful icons

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Ensure your Gemini API key is valid
3. Verify that voice features are supported in your browser
4. Create an issue in the repository

---

**Made with ❤️ for students everywhere**

*Transform your learning experience with the power of AI*
