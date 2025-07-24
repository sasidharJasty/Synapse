import { GoogleGenAI } from '@google/genai';

export class GeminiService {
  // Add static property to store conversation history
  static conversationHistory = [];

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
        contents: `You are an expert educator and memory coach. Your task is to create highly effective, clear, and accurate flashcards for the topic: '${topic}'.
- Each flashcard should focus on a single key concept, fact, or question relevant to the topic.
- Use simple, student-friendly language and avoid ambiguity.
- Include a concise summary of the topic.
- Also generate a quiz question with 3-5 options, the correct answer, and a brief explanation.
- Output must be in JSON with fields: summary, flashcards (array of {question, answer}), and quiz (question, options, correct, explanation).`,
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
        contents: `You are an expert productivity coach and study planner. Create a detailed, personalized daily study schedule for a student with the following goals: ${goals.join(', ')}.
- The user's current mood is ${mood}/10 and energy level is ${energyLevel}/10.
- If the total estimated time for all tasks exceeds 6 hours, intelligently split the tasks over multiple days, aiming for no more than 6 hours of study per day.
- Include at least one meditation session and several short breaks (5-10 minutes) between study blocks each day.
- For each scheduled item, specify the time, activity, duration (in minutes), intensity (low/medium/high), and a mood_adjustment tip tailored to the activity and the user's mood/energy.
- Meditation and breaks should be clearly labeled as such in the activity field.
- Provide actionable recommendations for optimizing study habits and a motivational quote.
- Output must be in JSON with fields: schedule (array), recommendations (array), motivational_quote (string).`,
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
        contents: `You are an expert goal-setting coach. Break down the goal: "${goal}" into 5 actionable, specific daily tasks.
- Each task should have a clear title, a detailed description, an estimated time (in minutes), and a priority (high/medium/low).
- Include a motivational quote and the total estimated time for all tasks.
- Output must be in JSON with fields: tasks (array), motivational_quote (string), total_estimated_time (integer).`,
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
        contents: `You are an expert in psychology and student well-being. Based on the user's mood score (${moodScore}/10) and description ("${moodDescription}"), provide:
- A personalized study suggestion
- An intensity adjustment (should the user work harder, take it easy, or maintain pace?)
- A motivational message
- 3-5 recommended activities for the user's current state
- Output must be in JSON with fields: study_suggestion, intensity_adjustment, motivational_message, recommended_activities (array).`,
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
        contents: `You are an expert academic assistant. Analyze the following lecture text and provide:
- A concise summary
- A list of the most important key points
- 3-5 clarifying questions a student might have
- A concept map with the main concept and sub-concepts
Lecture text: ${lectureText}
- Output must be in JSON with fields: summary, key_points (array), clarifying_questions (array), concept_map (object with main_concept and sub_concepts).`,
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
        contents: `You are an expert motivational coach. Generate a personalized, friendly, and motivational greeting for ${userName || 'Student'}.
- Time of day: ${timeGreeting}.
- The greeting should encourage studying and learning, and be under 100 characters.`,
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
        contents: `You are an expert in social connection and student engagement. Write a friendly, creative, and engaging icebreaker message for a study partner.
- Base it on the subject: ${subject} and the user's strengths: ${userStrengths.join(', ')}.
- The message should be positive, inviting, and spark a conversation.`,
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

  static async processVoiceCommand(command, includeHistory = true) {
    try {
      const ai = this.getModel();
      
      // Build conversation context
      let conversationContext = '';
      if (includeHistory && this.conversationHistory.length > 0) {
        conversationContext = '\n\nPrevious conversation context:\n' + 
          this.conversationHistory.map(entry => 
            `User: ${entry.command}\nAssistant: ${entry.response}`
          ).join('\n') + '\n\n';
      }

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert AI voice assistant for students. Process the following voice command and return a structured response.
- Analyze the command and determine the user's intent and the most appropriate action for a study assistant.
- Extract any relevant parameters (title, description, priority, due_date, etc.).
- Provide a helpful, natural-sounding response that acknowledges the command and offers next steps.
- Use the following possible intents: mood, goals, planner, flashcards, motivation, general.
- Use the following possible actions: add_task, add_goal, check_schedule, analyze_mood, generate_flashcards, unknown, error.
- Consider the conversation history to provide contextual responses.${conversationContext}Current command: "${command}"
- Output must be in JSON with fields: intent, action, parameters (object), response (string).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              intent: { type: "string", enum: ["mood", "goals", "planner", "flashcards", "motivation", "general"] },
              action: { type: "string", enum: ["add_task", "add_goal", "check_schedule", "analyze_mood", "generate_flashcards", "unknown", "error"] },
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  due_date: { type: "string", format: "date-time" }
                },
                propertyOrdering: ["title", "description", "priority", "due_date"]
              },
              response: { type: "string" }
            },
            propertyOrdering: ["intent", "action", "parameters", "response"]
          }
        }
      });
      
      const parsedResult = JSON.parse(result.text);
      
      // Validate the response structure
      if (!parsedResult || typeof parsedResult !== 'object') {
        throw new Error('Invalid response structure');
      }
      
      // Ensure all required fields are present
      const validatedResult = {
        intent: parsedResult.intent || 'general',
        action: parsedResult.action || 'unknown',
        parameters: parsedResult.parameters || {},
        response: parsedResult.response || "I understand your request. How can I help you further?"
      };
      
      // Add to conversation history
      this.addToConversationHistory(command, validatedResult.response);
      
      return validatedResult;
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorResponse = {
        intent: "general",
        action: "error",
        parameters: {},
        response: "Sorry, I couldn't process your command. Please try again."
      };
      
      // Add error to conversation history
      this.addToConversationHistory(command, errorResponse.response);
      
      return errorResponse;
    }
  }

  // Add method to manage conversation history
  static addToConversationHistory(command, response) {
    this.conversationHistory.push({
      timestamp: new Date().toISOString(),
      command: command,
      response: response
    });
    
    // Keep only the last 10 exchanges to prevent context overflow
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  // Add method to clear conversation history
  static clearConversationHistory() {
    this.conversationHistory = [];
  }

  // Add method to get conversation history
  static getConversationHistory() {
    return [...this.conversationHistory];
  }

  // Add method to export conversation history
  static exportConversationHistory() {
    return {
      timestamp: new Date().toISOString(),
      conversation: this.conversationHistory
    };
  }

  static async organizeTasks(prompt) {
    try {
      const ai = this.getModel();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert productivity assistant. Organize the following student tasks for optimal productivity, focus, and well-being. Use best practices in time management and student success. ${prompt}
- Output must be in JSON with fields: organized_tasks (array of {title, start_time, reasoning}), recommendations (array), motivational_quote (string).`,
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
      if (!key) {
        console.error('No API key provided');
        return false;
      }
      
      const ai = new GoogleGenAI({ apiKey: key });
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
        const isValid = parsed.hello === true;
        console.log('API key test result:', isValid ? 'SUCCESS' : 'FAILED', parsed);
        return isValid;
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError, 'Raw response:', text);
        return false;
      }
    } catch (error) {
      console.error('API key test error:', error);
      
      // Provide more specific error information
      if (error.message?.includes('API_KEY_INVALID')) {
        console.error('Invalid API key format');
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        console.error('API key doesn\'t have permission to access Gemini');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        console.error('API quota exceeded');
      } else if (error.message?.includes('MODEL_NOT_FOUND')) {
        console.error('Model not found - check if gemini-2.5-flash is available');
      }
      
      return false;
    }
  }

  static async askLectureQuestion(lectureText, question) {
    try {
      const ai = this.getModel();
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert academic tutor. Given the following lecture text, answer the user's question as accurately and thoroughly as possible.
- Provide a clear, concise answer, a list of supporting points from the lecture, and a confidence score (0-1).
Lecture: ${lectureText}
Question: ${question}
- Output must be in JSON with fields: answer (string), supporting_points (array), confidence (number).`,
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