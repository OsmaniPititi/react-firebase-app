const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {fetchTranscript} = require("youtube-transcript");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

exports.generateTimestamps = onCall({cors: true}, async (request) => {
  const {videoId, url} = request.data || {};
  if (!videoId) {
    throw new HttpsError("invalid-argument", "Missing 'videoId' in request data");
  }

  let transcript;
  try {
    transcript = await fetchTranscript(videoId);
  } catch (err) {
    logger.error("Failed to fetch transcript", {videoId, error: err.message});
    throw new HttpsError("internal", `Could not fetch transcript: ${err.message}`);
  }

  if (!transcript || transcript.length === 0) {
    throw new HttpsError("not-found", "No transcript content available for this video");
  }

  const transcriptText = transcript.map((item) => item.text).join(" ");

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    logger.error("DEEPSEEK_API_KEY is not set");
    throw new HttpsError("failed-precondition", "Server configuration error: API key not set");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${deepseekKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates YouTube video timestamps from transcripts. Given a video transcript, generate descriptive timestamps. Return ONLY a JSON array of strings, where each string is in the format "M:SS - Description". Group content logically by topic. Do not include any markdown formatting, code blocks, or extra text — only the raw JSON array.`,
        },
        {
          role: "user",
          content: `Generate timestamps for this YouTube video transcript:\n\n${transcriptText}`,
        },
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();

  if (data.error) {
    logger.error("DeepSeek API error", {error: data.error});
    throw new HttpsError("internal", `DeepSeek API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const content = data.choices?.[0]?.message?.content || "";
  let timestampsList;

  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    timestampsList = JSON.parse(cleaned);
  } catch {
    logger.error("Failed to parse DeepSeek response", {content});
    throw new HttpsError("internal", "Failed to parse timestamps from AI response");
  }

  if (!Array.isArray(timestampsList)) {
    throw new HttpsError("internal", "AI response was not a valid timestamps array");
  }

  const timestampsString = timestampsList.join("\n");

  return {
    url: url || `https://www.youtube.com/watch?v=${videoId}`,
    timestamps_list: timestampsList,
    timestamps_string: timestampsString,
    success: true,
  };
});
