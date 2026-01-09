
import { GoogleGenAI, Type } from "@google/genai";
import { CareerPath, ConceptTranslation, BackgroundAnalysis, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCareerPath = async (interests: string, skills: string): Promise<CareerPath> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are a Global Talent Strategist for the Energy sector. 
    Analyze the following profile and map a high-trajectory career path within Well Engineering, adhering to IOGP Report 476 progression standards.
    
    Interests: ${interests}
    Background: ${skills}
    
    Focus on:
    1. Mechanical-to-Engineering bridge points.
    2. IADC/IWCF technical entry tiers (Level 1 Awareness to Level 5 Well Design).
    3. The transition from field operations to technical well integrity.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          startRole: { type: Type.STRING },
          midPath: { type: Type.STRING },
          endGoal: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          justification: { type: Type.STRING }
        },
        required: ["startRole", "midPath", "endGoal", "skills", "justification"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const translateConcept = async (concept: string, hobby: string): Promise<ConceptTranslation> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are a Chief Well Engineering Mentor with 30 years of offshore experience. 
    Synthesize a rigorous technical bridge between the wellbore engineering concept "${concept}" and the user's domain: "${hobby}". 
    
    STRICT ENGINEERING REQUIREMENTS:
    - If explaining Hydrostatics: Focus on P = ρgh and the omnidirectional nature of fluid head.
    - If explaining Well Control: Reference the transition from Primary (Liquid) to Secondary (Mechanical) barriers. 
    - Include mentions of "Friction Loss", "Drillbench Dynamic Simulation", or "Gas Solubility in OBM" where applicable to increase rigor.
    - The analogy must be mathematically sound (e.g., comparing mud weight to gear ratios or hydraulic leverage).
    
    The explanation must move from the user's intuitive understanding to a professional IADC/IWCF level of technicality.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          physicsExplanation: { type: Type.STRING },
          hobbyAnalogy: { type: Type.STRING },
          mathematicalLogic: { type: Type.STRING },
          keyTakeaway: { type: Type.STRING },
          realWorldScenario: { type: Type.STRING }
        },
        required: ["physicsExplanation", "hobbyAnalogy", "mathematicalLogic", "keyTakeaway", "realWorldScenario"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateKnowledgeCheck = async (lessonTitle: string, lessonContent: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 3-question knowledge check for the following lesson.
    Lesson Title: ${lessonTitle}
    Content: ${lessonContent}
    
    Ensure questions are highly technical and test the user's understanding of engineering principles, not just terminology.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const analyzeBackground = async (employment: string, strengths: string, weaknesses: string): Promise<BackgroundAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `As a Senior Talent Auditor for a global drilling contractor, perform a "Gap Analysis" for a candidate transitioning into Well Engineering.
    
    Candidate History:
    - Employment: ${employment}
    - Strengths: ${strengths}
    - Weaknesses: ${weaknesses}
    
    Evaluate based on the IOGP Report 476 Competency Framework.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transferabilityScore: { type: Type.NUMBER },
          strengthsDeepDive: { type: Type.STRING },
          gapAnalysis: { type: Type.STRING },
          transitionStrategy: { type: Type.STRING },
          recommendedFocus: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["transferabilityScore", "strengthsDeepDive", "gapAnalysis", "transitionStrategy", "recommendedFocus"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
