import { GoogleGenAI } from '@google/genai';

export class GeminiService {
  static getApiKey() {
    return localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY;
  }

  static getModel() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please add your API key in Settings.');
    }
    
    const ai = new GoogleGenAI({ apiKey });
    return ai;
  }

  static async generateFlashcards(topic) {
    try {
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate flashcards for the topic '${topic}'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" }
                  },
                  propertyOrdering: ["question", "answer"]
                }
              },
              quiz: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct: { type: "string" },
                  explanation: { type: "string" }
                },
                propertyOrdering: ["question", "options", "correct", "explanation"]
              }
            },
            propertyOrdering: ["summary", "flashcards", "quiz"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  static async generateSchedule(mood, goals, energyLevel) {
    try {
      const ai = this.getModel();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a daily study schedule for the following goals: ${goals.join(', ')}. The user mood is ${mood}/10 and energy level is ${energyLevel}/10. 
- If the total estimated time for all tasks exceeds 6 hours, split the tasks over multiple days, aiming for no more than 6 hours of study per day.
- Include at least one meditation session and several short breaks (5-10 minutes) between study blocks each day.
- For each scheduled item, specify the time, activity, duration (in minutes), intensity (low/medium/high), and a mood_adjustment tip.
- Meditation and breaks should be clearly labeled as such in the activity field.
Return the schedule as an array, and also provide recommendations and a motivational quote.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: { type: "string" },
                    activity: { type: "string" },
                    duration: { type: "integer" },
                    intensity: { type: "string", enum: ["low", "medium", "high"] },
                    mood_adjustment: { type: "string" }
                  },
                  propertyOrdering: ["time", "activity", "duration", "intensity", "mood_adjustment"]
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              },
              motivational_quote: { type: "string" }
            },
            propertyOrdering: ["schedule", "recommendations", "motivational_quote"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  static async breakdownGoal(goal) {
    try {
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Break down the goal "${goal}" into 5 actionable daily tasks.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    estimated_time: { type: "integer" },
                    priority: { type: "string", enum: ["high", "medium", "low"] }
                  },
                  propertyOrdering: ["title", "description", "estimated_time", "priority"]
                }
              },
              motivational_quote: { type: "string" },
              total_estimated_time: { type: "integer" }
            },
            propertyOrdering: ["tasks", "motivational_quote", "total_estimated_time"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error breaking down goal:', error);
      throw error;
    }
  }

  static async analyzeMood(moodScore, moodDescription) {
    try {
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on mood score ${moodScore}/10 and description "${moodDescription}", provide study suggestions.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              study_suggestion: { type: "string" },
              intensity_adjustment: { type: "string" },
              motivational_message: { type: "string" },
              recommended_activities: {
                type: "array",
                items: { type: "string" }
              }
            },
            propertyOrdering: ["study_suggestion", "intensity_adjustment", "motivational_message", "recommended_activities"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      throw error;
    }
  }

  static async enhanceLecture(lectureText) {
    try {
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this lecture text and provide a summary, key points, clarifying questions, and a concept map. Lecture text: ${lectureText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              key_points: {
                type: "array",
                items: { type: "string" }
              },
              clarifying_questions: {
                type: "array",
                items: { type: "string" }
              },
              concept_map: {
                type: "object",
                properties: {
                  main_concept: { type: "string" },
                  sub_concepts: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                propertyOrdering: ["main_concept", "sub_concepts"]
              }
            },
            propertyOrdering: ["summary", "key_points", "clarifying_questions", "concept_map"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error enhancing lecture:', error);
      throw error;
    }
  }

  static async generateGreeting(userName) {
    try {
      const ai = this.getModel();
      
      const timeOfDay = new Date().getHours();
      let timeGreeting = '';
      
      if (timeOfDay < 12) timeGreeting = 'Good morning';
      else if (timeOfDay < 17) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a personalized greeting for ${userName || 'Student'}. Time of day: ${timeGreeting}. Return a friendly, motivational greeting that encourages studying and learning. Keep it under 100 characters.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "string"
          }
        }
      });
      return JSON.parse(result.text);
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
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate an icebreaker message for a study partner based on subject: ${subject} and user strengths: ${userStrengths.join(', ')}. Return a friendly, engaging message to start a conversation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "string"
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      return "Hey! I'm also studying this subject. Want to study together?";
    }
  }

  static async processVoiceCommand(command) {
    try {
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Process this voice command and return a structured response. Command: "${command}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["add_task", "add_goal", "check_schedule", "analyze_mood", "generate_flashcards", "unknown", "error"] },
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  due_date: { type: "string", format: "date" }
                },
                propertyOrdering: ["title", "description", "priority", "due_date"]
              },
              response: { type: "string" }
            },
            propertyOrdering: ["action", "parameters", "response"]
          }
        }
      });
      return JSON.parse(result.text);
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
      const ai = this.getModel();
      
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              organized_tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    start_time: { type: "string" },
                    reasoning: { type: "string" }
                  },
                  propertyOrdering: ["title", "start_time", "reasoning"]
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              },
              motivational_quote: { type: "string" }
            },
            propertyOrdering: ["organized_tasks", "recommendations", "motivational_quote"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error organizing tasks:', error);
      throw error;
    }
  }

  static async testApiKey(apiKey) {
    try {
      const key = apiKey || this.getApiKey();
      if (!key) return false;
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say 'hello' as JSON: {\"hello\":true}",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              hello: { type: "boolean" }
            },
            propertyOrdering: ["hello"]
          }
        }
      });
      const text = result.text;
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

  static async askLectureQuestion(lectureText, question) {
    try {
      const ai = this.getModel();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Given the following lecture text, answer the user's question as accurately as possible.\nLecture: ${lectureText}\nQuestion: ${question}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              supporting_points: {
                type: "array",
                items: { type: "string" }
              },
              confidence: { type: "number" }
            },
            propertyOrdering: ["answer", "supporting_points", "confidence"]
          }
        }
      });
      return JSON.parse(result.text);
    } catch (error) {
      console.error('Error answering lecture question:', error);
      return { answer: 'Error generating answer.', supporting_points: [], confidence: 0 };
    }
  }
} 