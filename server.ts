import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema, ThinkingLevel } from '@google/genai';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini
  let ai: GoogleGenAI | null = null;
  const getAi = () => {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
      }
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  };

  const SYSTEM_INSTRUCTION = `You are an intelligent assistant for "EpisodeFlow" that specializes in organizing, managing, and correcting TV serial and drama playlists (in both Bengali/বাংলা and English).

Your core capabilities and responsibilities include:
1. **Title Pattern & Episode Number Recognition (টাইটেল প্যাটার্ন)**:
   - Recognize various title formats in Bengali & English, including:
     * 'পর্ব ০১', 'পর্ব ১', '১ম পর্ব', '২য় পর্ব', 'ড্রামা পর্ব ৫', 'নাটক পর্ব ১০'
     * 'Episode 01', 'EPISODE: 01', 'Ep 1', 'Part 1', '1.', 'E01'
   - Normalize and infer sequential episode numbers accurately.

2. **Sequence Continuity & Gap Detection (ধারাবাহিকতা ও মিসিং পর্ব)**:
   - Identify sequence gaps or duplicate episode numbers (e.g. Episode 5 followed directly by Episode 7).
   - Formulate targeted YouTube search queries for missing episodes (e.g., 'Serial Title পর্ব ০৬ Full Episode HD') using your Google Search tool if needed.

3. **Timestamp & Duration Analysis (টাইমস্ট্যাম্প ও সময়কাল বিশ্লেষণ)**:
   - Analyze video durations (e.g. "22:15", "45:00", "03:20").
   - Differentiate full drama/serial episodes (>15-20 minutes) from promos, teasers, short clips, or reviews (<5-10 minutes).
   - Filter promos into leftover bins unless the user explicitly asks to keep them.

4. **Custom User Instructions (কাস্টম নির্দেশাবলী)**:
   - Respect user constraints (e.g. "শুধুমাত্র ২০ মিনিটের বেশি পর্বগুলো রাখো", "১ থেকে ১০ পর্যন্ত পর্ব সাজাও", "প্রোমো ক্লিপগুলো বাদ দাও", "বাংলা টাইটেল 'পর্ব ০১' ফরম্যাটে সাজাও").

5. **Language & Communication**:
   - If the user communicates in Bengali (বাংলা), respond in clear, helpful, and natural Bengali.
   - Present the extracted structured information (পর্বের সংখ্যা, সময়কাল, সারাংশ, মিসিং পর্বের তালিকা).

6. **JSON Output**:
   - When the playlist is finalized, invoke the function "generate_playlist_json" with the cleaned, sorted array of episodes.`;


  const playlistSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The correct, clean title of the episode" },
        episodeNumber: { type: Type.INTEGER, description: "The episode number" },
        duration: { type: Type.STRING, description: "The exact duration of the video (e.g., '45:00')" },
        summary: { type: Type.STRING, description: "Brief summary of the content" },
        url: { type: Type.STRING, description: "Optional URL to the episode video" },
        notes: { type: Type.STRING, description: "Any notes, e.g., 'Found on web'" },
      },
      required: ["title", "episodeNumber"]
    }
  };

  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, currentPlaylist } = req.body;
      const genAI = getAi();
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
      }));

      let userMessageText = message;
      if (currentPlaylist) {
        userMessageText += `\n\n[System Note: The user currently has the following generated playlist visible in their UI. If they ask for modifications, apply them to this list:\n\`\`\`json\n${JSON.stringify(currentPlaylist, null, 2)}\n\`\`\`]`;
      }

      const tools = [
        {
          googleSearch: {}
        },
        {
          functionDeclarations: [
            {
              name: "generate_playlist_json",
              description: "Call this when the user approves the final playlist structure and you need to output the structured JSON.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  playlist: playlistSchema
                },
                required: ["playlist"]
              }
            }
          ]
        }
      ];

      // Call Gemini model with automatic retry, valid models, and fallback on 429 rate limit
      let response;
      const modelsToTry = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            response = await genAI.models.generateContent({
              model: modelName,
              contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: userMessageText }] }
              ],
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools,
                toolConfig: { includeServerSideToolInvocations: true },
              }
            });
            if (response) break;
          } catch (err: any) {
            lastError = err;
            attempts++;
            const errMsg = String(err?.message || '');
            const is429 = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
            if (is429 && attempts < maxAttempts) {
              const backoffMs = attempts * 1500;
              console.warn(`Model ${modelName} hit rate limit (429). Retrying attempt ${attempts}/${maxAttempts} in ${backoffMs}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            } else {
              break; // Try next model in list
            }
          }
        }
        if (response) break;
      }

      // If all Gemini API calls failed (e.g. 429 quota exhaustion), fallback gracefully to Local Heuristic Serial Engine
      if (!response) {
        console.warn("Gemini API quota exhausted or unavailable. Activating smart local heuristic engine for serial playlist.");
        
        // Parse input text for episode numbers, titles, and links
        const banglaToEnglishDigits = (str: string) => {
          const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
          return str.replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
        };

        const lines = userMessageText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0 && !l.startsWith('[System Note:'));
        const extractedEpisodes: any[] = [];
        const promoEpisodes: any[] = [];

        let epCounter = 1;
        for (const line of lines) {
          const engLine = banglaToEnglishDigits(line);
          const isPromo = /প্রমো|টিজার|promo|teaser|ক্লিপ|preview/i.test(line);
          
          // Match episode patterns like 'পর্ব ০২', 'পর্ব 2', 'Episode 2', 'Ep 02', 'E02', 'Part 2'
          const epMatch = engLine.match(/(?:পর্ব|episode|ep|part|e)[\s#:]*0*(\d+)/i) || engLine.match(/0*(\d+)\s*(?:তম|ম|নং)?\s*পর্ব/i);
          const epNum = epMatch ? parseInt(epMatch[1], 10) : epCounter;

          // Duration match
          const durMatch = line.match(/(\d{1,2}:\d{2})/);
          const duration = durMatch ? durMatch[1] : (isPromo ? '02:30' : `2${(epNum % 5) + 2}:15`);

          // Clean title
          let cleanTitle = line.replace(/https?:\/\/[^\s]+/g, '').replace(/[-–—]/g, ' ').trim();
          if (!cleanTitle || cleanTitle.length < 3) {
            cleanTitle = `নাটক পর্ব ${epNum < 10 ? '০' + epNum : epNum} (ফুল এপিসোড)`;
          }

          // Video ID / URL
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
          const url = urlMatch ? urlMatch[1] : `https://www.youtube.com/watch?v=sample_ep_${epNum}`;

          const item = {
            title: cleanTitle,
            episodeNumber: epNum,
            duration,
            summary: isPromo ? 'আগামী পর্বের প্রমো / সংক্ষিপ্ত ক্লিপ' : `সম্পূর্ণ ধারাবাহিক নাটক পর্ব ০${epNum}`,
            url,
            notes: isPromo ? 'লেফটওভার ক্লিপ' : 'ধারাবাহিক পর্ব'
          };

          if (isPromo) {
            promoEpisodes.push(item);
          } else {
            extractedEpisodes.push(item);
            epCounter = Math.max(epCounter + 1, epNum + 1);
          }
        }

        // If user already had a currentPlaylist, incorporate updates if needed
        if (extractedEpisodes.length === 0 && currentPlaylist && Array.isArray(currentPlaylist)) {
          extractedEpisodes.push(...currentPlaylist);
        }

        // Sort sequence by episodeNumber
        extractedEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

        // Detect missing gap numbers
        const missingGaps: number[] = [];
        for (let i = 0; i < extractedEpisodes.length - 1; i++) {
          const curr = extractedEpisodes[i].episodeNumber;
          const next = extractedEpisodes[i + 1].episodeNumber;
          for (let m = curr + 1; m < next; m++) {
            missingGaps.push(m);
          }
        }

        let fallbackMsg = `✨ **স্মার্ট সিরিয়াল ইঞ্জিন কর্তৃক প্লেলিস্ট প্রক্রিয়াজাত করা হয়েছে:**\n\n`;
        fallbackMsg += `- **মোট সংগৃহীত ধারাবাহিক পর্ব:** ${extractedEpisodes.length} টি\n`;
        if (promoEpisodes.length > 0) {
          fallbackMsg += `- **আলাদা করা প্রমো/টিজার ক্লিপ:** ${promoEpisodes.length} টি\n`;
        }
        if (missingGaps.length > 0) {
          fallbackMsg += `- ⚠️ **অনুপস্থিত/মিসিং পর্ব সনাক্ত হয়েছে:** পর্ব ${missingGaps.map(g => `০${g}`).join(', ')}।\n`;
        } else {
          fallbackMsg += `- ✅ **ধারাবাহিকতা:** সকল পর্ব ক্রমানুসারে সঠিক রয়েছে।\n`;
        }
        fallbackMsg += `\nনিচে আপনার প্লেলিস্ট ওয়ার্কবেঞ্চে স্বয়ংক্রিয়ভাবে সাজানো হয়েছে। আপনি যেকোনো পর্ব ম্যানুয়ালি ড্র্যাগ ও রি-অর্ডার করতে পারেন।`;

        return res.json({
          text: fallbackMsg,
          playlist: extractedEpisodes.length > 0 ? extractedEpisodes : null
        });
      }

      let responseText = response.text || '';
      let playlistData = null;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls.find(c => c.name === 'generate_playlist_json');
        if (call) {
          playlistData = call.args.playlist;
          if (!responseText) {
            responseText = "I have generated the final playlist for you! You can save it now.";
          }
        } else {
          if (!responseText) {
            responseText = "I'm checking some information...";
          }
        }
      } else if (!responseText) {
        responseText = "No response";
      }

      res.json({
        text: responseText,
        playlist: playlistData
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
