import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  static getApiKey() {
    return localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;
  }

  static getModel() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add your API key in Settings.');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  static async generateFlashcards(topic) {
    try {
      const model = this.getModel();
      
      const prompt = `For the topic '${topic}', return the following in JSON format:
      {
        "summary": "A short summary (max 100 words)",
        "flashcards": [
          {
            "question": "Question 1",
            "answer": "Answer 1"
          },
          {
            "question": "Question 2", 
            "answer": "Answer 2"
          },
          {
            "question": "Question 3",
            "answer": "Answer 3"
          }
        ],
        "quiz": {
          "question": "Multiple choice question",
          "options": ["A", "B", "C", "D"],
          "correct": "A",
          "explanation": "Why this is correct"
        }
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON, fallback to text if parsing fails
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          summary: text,
          flashcards: [],
          quiz: null
        };
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  static async generateSchedule(mood, goals, energyLevel) {
    try {
      const model = this.getModel();
      
      const prompt = `Create a daily study schedule based on:
      - Current mood: ${mood}/10
      - Energy level: ${energyLevel}/10
      - Goals: ${goals.join(', ')}
      
      Return in JSON format:
      {
        "schedule": [
          {
            "time": "9:00 AM",
            "activity": "Activity description",
            "duration": 60,
            "intensity": "low/medium/high",
            "mood_adjustment": "How this activity affects mood"
          }
        ],
        "recommendations": ["Study tip 1", "Study tip 2"],
        "motivational_quote": "A motivational quote"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          schedule: [],
          recommendations: [],
          motivational_quote: "You've got this!"
        };
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  static async breakdownGoal(goal) {
    try {
      const model = this.getModel();
      
      const prompt = `Break down the goal "${goal}" into 5 actionable daily tasks.
      Return in JSON format:
      {
        "tasks": [
          {
            "title": "Task title",
            "description": "Detailed description",
            "estimated_time": 30,
            "priority": "high/medium/low"
          }
        ],
        "motivational_quote": "Motivational quote",
        "total_estimated_time": 150
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          tasks: [],
          motivational_quote: "Every journey begins with a single step.",
          total_estimated_time: 0
        };
      }
    } catch (error) {
      console.error('Error breaking down goal:', error);
      throw error;
    }
  }

  static async analyzeMood(moodScore, moodDescription) {
    try {
      const model = this.getModel();
      
      const prompt = `Based on mood score ${moodScore}/10 and description "${moodDescription}", provide:
      {
        "study_suggestion": "What type of study activity would be best",
        "intensity_adjustment": "How to adjust study intensity",
        "motivational_message": "A personalized motivational message",
        "recommended_activities": ["Activity 1", "Activity 2", "Activity 3"]
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          study_suggestion: "Take a light review session",
          intensity_adjustment: "Reduce intensity by 20%",
          motivational_message: "It's okay to have off days. You're doing great!",
          recommended_activities: ["Light reading", "Review notes", "Take a break"]
        };
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
      throw error;
    }
  }

  static async enhanceLecture(lectureText) {
    try {
      const model = this.getModel();
      
      const prompt = `Analyze this lecture text and provide:
      {
        "summary": "Key points summary",
        "key_points": ["Point 1", "Point 2", "Point 3"],
        "clarifying_questions": ["Question 1", "Question 2"],
        "concept_map": {
          "main_concept": "Central idea",
          "sub_concepts": ["Sub-concept 1", "Sub-concept 2"]
        }
      }
      
      Lecture text: ${lectureText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          summary: "Lecture analysis completed",
          key_points: [],
          clarifying_questions: [],
          concept_map: {
            main_concept: "Main topic",
            sub_concepts: []
          }
        };
      }
    } catch (error) {
      console.error('Error enhancing lecture:', error);
      throw error;
    }
  }

  static async generateGreeting(userName) {
    try {
      const model = this.getModel();
      
      const timeOfDay = new Date().getHours();
      let timeGreeting = '';
      
      if (timeOfDay < 12) timeGreeting = 'Good morning';
      else if (timeOfDay < 17) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';

      const prompt = `Generate a personalized greeting for ${userName || 'Student'}.
      Time of day: ${timeGreeting}
      
      Return a friendly, motivational greeting that encourages studying and learning.
      Keep it under 100 characters.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error generating greeting:', error);
      // Fallback greeting
      const timeOfDay = new Date().getHours();
      let timeGreeting = '';
      
      if (timeOfDay < 12) timeGreeting = 'Good morning';
      else if (timeOfDay < 17) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';
      
      return `${timeGreeting}, ${userName || 'Student'}! Ready to learn?`;
    }
  }

  static async generateIcebreaker(subject, userStrengths) {
    try {
      const model = this.getModel();
      
      const prompt = `Generate an icebreaker message for a study partner based on:
      - Subject: ${subject}
      - User strengths: ${userStrengths.join(', ')}
      
      Return a friendly, engaging message to start a conversation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      return "Hey! I'm also studying this subject. Want to study together?";
    }
  }

  static async processVoiceCommand(command) {
    try {
      const model = this.getModel();
      
      const prompt = `Process this voice command and return a JSON response:
      Command: "${command}"
      
      Return format:
      {
        "action": "add_task|add_goal|check_schedule|analyze_mood|generate_flashcards",
        "parameters": {
          "title": "Task or goal title",
          "description": "Description if applicable",
          "priority": "high|medium|low",
          "due_date": "YYYY-MM-DD if applicable"
        },
        "response": "Natural language response to user"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          action: "unknown",
          parameters: {},
          response: "I didn't understand that command. Please try again."
        };
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        action: "error",
        parameters: {},
        response: "Sorry, I couldn't process your command. Please try again."
      };
    }
  }

  static async organizeTasks(prompt) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (e) {
        return {
          organized_tasks: [],
          recommendations: [],
          motivational_quote: "Stay organized and focused!"
        };
      }
    } catch (error) {
      console.error('Error organizing tasks:', error);
      throw error;
    }
  }
} 