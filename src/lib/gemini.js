import { GoogleGenerativeAI, Type } from '@google/generative-ai';

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
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  static async generateFlashcards(topic) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Generate flashcards for the topic '${topic}'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  propertyOrdering: ["question", "answer"]
                }
              },
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correct: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                propertyOrdering: ["question", "options", "correct", "explanation"]
              }
            },
            propertyOrdering: ["summary", "flashcards", "quiz"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  static async generateSchedule(mood, goals, energyLevel) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Create a daily study schedule based on mood (${mood}/10), energy level (${energyLevel}/10), and goals: ${goals.join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    intensity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                    mood_adjustment: { type: Type.STRING }
                  },
                  propertyOrdering: ["time", "activity", "duration", "intensity", "mood_adjustment"]
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              motivational_quote: { type: Type.STRING }
            },
            propertyOrdering: ["schedule", "recommendations", "motivational_quote"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  static async breakdownGoal(goal) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Break down the goal "${goal}" into 5 actionable daily tasks.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimated_time: { type: Type.INTEGER },
                    priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
                  },
                  propertyOrdering: ["title", "description", "estimated_time", "priority"]
                }
              },
              motivational_quote: { type: Type.STRING },
              total_estimated_time: { type: Type.INTEGER }
            },
            propertyOrdering: ["tasks", "motivational_quote", "total_estimated_time"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error breaking down goal:', error);
      throw error;
    }
  }

  static async analyzeMood(moodScore, moodDescription) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Based on mood score ${moodScore}/10 and description "${moodDescription}", provide study suggestions.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              study_suggestion: { type: Type.STRING },
              intensity_adjustment: { type: Type.STRING },
              motivational_message: { type: Type.STRING },
              recommended_activities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            propertyOrdering: ["study_suggestion", "intensity_adjustment", "motivational_message", "recommended_activities"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      throw error;
    }
  }

  static async enhanceLecture(lectureText) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Analyze this lecture text and provide a summary, key points, clarifying questions, and a concept map. Lecture text: ${lectureText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              key_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              clarifying_questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              concept_map: {
                type: Type.OBJECT,
                properties: {
                  main_concept: { type: Type.STRING },
                  sub_concepts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                propertyOrdering: ["main_concept", "sub_concepts"]
              }
            },
            propertyOrdering: ["summary", "key_points", "clarifying_questions", "concept_map"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
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

      const result = await model.generateContent({
        contents: `Generate a personalized greeting for ${userName || 'Student'}. Time of day: ${timeGreeting}. Return a friendly, motivational greeting that encourages studying and learning. Keep it under 100 characters.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.STRING
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
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
      
      const result = await model.generateContent({
        contents: `Generate an icebreaker message for a study partner based on subject: ${subject} and user strengths: ${userStrengths.join(', ')}. Return a friendly, engaging message to start a conversation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.STRING
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      return "Hey! I'm also studying this subject. Want to study together?";
    }
  }

  static async processVoiceCommand(command) {
    try {
      const model = this.getModel();
      
      const result = await model.generateContent({
        contents: `Process this voice command and return a structured response. Command: "${command}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, enum: ["add_task", "add_goal", "check_schedule", "analyze_mood", "generate_flashcards", "unknown", "error"] },
              parameters: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  due_date: { type: Type.STRING, format: "date" }
                },
                propertyOrdering: ["title", "description", "priority", "due_date"]
              },
              response: { type: Type.STRING }
            },
            propertyOrdering: ["action", "parameters", "response"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
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
      
      const result = await model.generateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              organized_tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    start_time: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                  },
                  propertyOrdering: ["title", "start_time", "reasoning"]
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              motivational_quote: { type: Type.STRING }
            },
            propertyOrdering: ["organized_tasks", "recommendations", "motivational_quote"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error organizing tasks:', error);
      throw error;
    }
  }

  static async testApiKey(apiKey) {
    try {
      const key = apiKey || this.getApiKey();
      if (!key) return false;
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: "Say 'hello' as JSON: {\"hello\":true}",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hello: { type: Type.BOOLEAN }
            },
            propertyOrdering: ["hello"]
          }
        }
      });
      const response = await result.response;
      const text = response.text();
      try {
        const parsed = JSON.parse(text);
        return parsed.hello === true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }
} 