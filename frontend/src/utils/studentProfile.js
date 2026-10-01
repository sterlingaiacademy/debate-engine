/**
 * studentProfile.js
 *
 * Shared utility for fetching the student's living coaching profile
 * before an ElevenLabs session starts. Uses a timeout so it NEVER
 * blocks session initialisation — a missing profile is a graceful no-op.
 */

import { API_BASE } from '../api';

const FETCH_TIMEOUT_MS = 2500;

/**
 * Fetches the student's coaching profile text.
 * Returns the profile string, or null if unavailable / timed-out.
 *
 * @param {string|number} studentId
 * @returns {Promise<string|null>}
 */
export async function fetchStudentProfile(studentId) {
  if (!studentId) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(
      `${API_BASE}/api/student/profile?studentId=${encodeURIComponent(studentId)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.profile || null;
  } catch {
    // Timeout, network error, etc. — always fail silently
    return null;
  }
}

/**
 * Returns a `dynamicVariables` entry for the student profile + name.
 * Safe to spread into any existing dynamicVariables object.
 *
 * ElevenLabs agents must have {{student_profile}} in their system prompt
 * and may use {{student_name}} in their First Message field.
 *
 * @param {string|null} profile
 * @param {string} [name]
 * @returns {{ student_profile: string, student_name: string }}
 */
export function profileVariable(profile, name = 'there') {
  return {
    student_name: name || 'there',
    student_profile: profile
      ? `STUDENT COACHING PROFILE (use this to personalise your coaching):\n\n${profile}`
      : 'No previous session history available for this student.',
  };
}

/**
 * Builds a personalised spoken first message for the ElevenLabs agent
 * based on the student's coaching profile. Pass this to:
 *
 *   Conversation.startSession({
 *     overrides: { agent: { firstMessage: buildFirstMessage(profile, name, mode) } }
 *   })
 *
 * - If the student has a profile: references name + a specific coaching tip
 * - If the student is new: gives a warm generic welcome
 * - Kept SHORT (≤ 2 sentences) so it feels natural when spoken aloud
 *
 * @param {string|null} profile  - The full profile text from /api/student/profile
 * @param {string}      name     - The student's display name
 * @param {string}      mode     - 'debate' | 'mock_un' | 'tutor' | 'speech' | 'persona'
 * @returns {string}
 */
export function buildFirstMessage(profile, name, mode = 'debate') {
  const firstName = (name || '').split(' ')[0] || 'there';

  if (!profile) {
    // New student — warm, encouraging welcome
    const welcomes = {
      debate:        `Hey ${firstName}! Great to meet you — I'm your debate coach. What topic are we arguing today?`,
      debate_junior: `Heyyyy ${firstName}! I am SO happy you are here! I am Leo — your Debate Buddy! Are you ready to have fun today?`,
      mock_un: `Welcome, Delegate ${firstName}! I'm your Model UN chair. Let's get into the resolution.`,
      tutor:   `Hey ${firstName}! I'm your AI tutor. What do you want to work on today?`,
      speech:  `Hi ${firstName}! I'm your Speech Coach. Let's warm up your voice and get practising.`,
      persona: `Greetings, ${firstName}. I understand you'd like to discuss ideas with me today — let us begin.`,
    };
    return welcomes[mode] || welcomes.debate;
  }

  // Extract the "Next Session Coaching Focus" from the profile if present
  const focusMatch = profile.match(/##\s*Next Session Coaching Focus\s*\n([\s\S]*?)(?=\n##|$)/i);
  const focusLine = focusMatch
    ? focusMatch[1].trim().split('\n').filter(l => l.trim())[0]?.replace(/^[\d.\-*•\s]+/, '').trim()
    : null;

  // Extract recent trend line
  const trendMatch = profile.match(/##\s*Recent Trend\s*\n([\s\S]*?)(?=\n##|$)/i);
  const trendLine = trendMatch
    ? trendMatch[1].trim().split('\n')[0]?.replace(/^[\d.\-*•\s]+/, '').trim()
    : null;

  if (mode === 'debate_junior') {
    // Extract a favourite topic from the profile if present
    const topicMatch = profile.match(/favourite[^\n]*?([Dd]oraemon|[Cc]hota [Bb]heem|cartoon|toy|cricket|football|[Mm]ango|chocolate|pizza|dog|cat)/i);
    const favTopic = topicMatch ? topicMatch[1] : null;
    if (favTopic) {
      return `Heyyyy ${firstName}!! Wowww you are back! I still remember — you love ${favTopic}! Should we debate about that today? It will be SO fun!`;
    }
    return focusLine
      ? `Heyyyy ${firstName}!! Yesss you are back! I am SO happy! Ready to debate and have lots of fun today?`
      : `Heyyyy ${firstName}!! I missed you so much! I am Leo — let us have the best debate ever today! Ready?`;
  }

  if (mode === 'debate') {
    if (focusLine) {
      return `Hey ${firstName}, welcome back! Today we're focusing on this: ${focusLine}. Ready to go?`;
    }
    return trendLine
      ? `Hey ${firstName}, good to have you back! ${trendLine}. Let's keep building on that. What topic are we debating?`
      : `Hey ${firstName}, welcome back to Debate Arena! I've reviewed your progress — let's make this session count.`;
  }

  if (mode === 'mock_un') {
    return focusLine
      ? `Welcome back, Delegate ${firstName}. Today we'll focus on: ${focusLine}. The floor is yours.`
      : `Welcome back, Delegate ${firstName}. I've seen your previous sessions — let's raise the level today.`;
  }

  if (mode === 'speech') {
    return focusLine
      ? `Hi ${firstName}, great to see you again! Let's work on this: ${focusLine}.`
      : `Hi ${firstName}, welcome back to Speech Coach! Let's build on where you left off.`;
  }

  if (mode === 'tutor') {
    return `Hey ${firstName}, good to see you! I know what you've been working on — what do you want to tackle today?`;
  }

  if (mode === 'persona') {
    return `Greetings again, ${firstName}. I recall our previous conversations — shall we continue?`;
  }

  return `Hey ${firstName}, welcome back! I've reviewed your progress. Let's make this session great.`;
}
