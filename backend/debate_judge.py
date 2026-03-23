"""
Rule-Based Debate Judge for ElevenLabs Conversational AI Transcripts
=====================================================================
Parses unstructured ElevenLabs debate transcripts, extracts only the
HUMAN speaker's turns (ASR blocks), and produces detailed scoring,
feedback, strengths, and areas to improve.

Usage:
    from debate_judge import DebateJudge

    judge = DebateJudge()

    # From a transcript string
    result = judge.judge(transcript_text)
    print(result)                                       # pretty text report

    result_dict = judge.judge(transcript_text, output_format="dict")   # for API
    result_json = judge.judge(transcript_text, output_format="json")   # JSON string

    # From a file
    result = judge.judge_file("transcript.txt")
"""

import re
import json
import math
from dataclasses import dataclass, field
from typing import Optional


# ─────────────────────────────────────────────────────────────────────
# 1. ELEVENLABS TRANSCRIPT PARSER
# ─────────────────────────────────────────────────────────────────────

class ElevenLabsParser:
    """
    Parses ElevenLabs conversational AI transcripts.

    ElevenLabs format (observed):
        - AI turns are followed by metadata lines like "LLM", "TTS", timestamps
        - Human turns are followed by "ASR" (Automatic Speech Recognition)
        - Timestamps appear as "0:00", "1:23", etc.
        - Metadata lines contain "ms" durations like "321 ms", "610 ms"
        - Stage labels like "Level 4 Main" appear between turns
        - Mood tags like "[Serious]" prefix AI responses
        - Bracketed noise: [phone ringing], [sniffs], [inhales], "Mm-hmm"
    """

    # Noise / non-speech in brackets
    NOISE_PATTERN = re.compile(r"\[(?:phone ringing|sniffs|inhales|exhales|coughs?|laughs?|noise|pause|silence|background|lips?\s*smack)[^\]]*\]", re.IGNORECASE)
    FILLER_SOUNDS = re.compile(r"\bMm-hmm\b\.?\.?\.?", re.IGNORECASE)
    MOOD_TAG = re.compile(r"^\[(?:Serious|Friendly|Neutral|Angry|Calm|Excited)\]\s*", re.IGNORECASE)
    ELLIPSIS_ARTIFACTS = re.compile(r"^\.{2,}\s*")

    def parse(self, raw: str) -> dict:
        """
        Returns:
            {
                "debater_name": str or None,
                "debater_class": str or None,
                "motion": str or None,
                "debater_side": str or None,
                "human_turns": [{"index": int, "text": str, "timestamp": str}],
                "ai_turns": [{"index": int, "text": str}],
                "raw_turn_sequence": [{"speaker": "human"|"ai", "text": str}],
            }
        """
        lines = raw.strip().split("\n")
        turns = self._extract_turns(lines)

        meta = self._extract_metadata(turns)

        return {
            "debater_name": meta.get("name"),
            "debater_class": meta.get("class"),
            "motion": meta.get("motion"),
            "debater_side": meta.get("side"),
            "human_turns": [t for t in turns if t["speaker"] == "human"],
            "ai_turns": [t for t in turns if t["speaker"] == "ai"],
            "raw_turn_sequence": turns,
        }

    def _extract_turns(self, lines: list[str]) -> list[dict]:
        """Walk through lines, group into AI vs Human turns using ASR/LLM/TTS markers."""
        turns = []
        current_lines = []
        current_timestamp = None
        turn_index = 0

        i = 0
        while i < len(lines):
            line = lines[i].strip()
            i += 1

            if not line:
                continue

            # Timestamp
            ts_match = re.match(r"^(\d+:\d{2})$", line)
            if ts_match:
                current_timestamp = ts_match.group(1)
                continue

            # Turn-type markers
            if line.upper() in ("ASR", "LLM", "TTS"):
                marker = line.upper()

                # Skip latency line (e.g., "321 ms" or "1.2 s")
                if i < len(lines) and re.match(r"^\d+(\.\d+)?\s*(ms|s)$", lines[i].strip()):
                    i += 1
                # Also skip "TTS Model Override" style lines
                if i < len(lines) and re.match(r"^TTS\s+Model", lines[i].strip(), re.IGNORECASE):
                    i += 1
                    if i < len(lines) and re.match(r"^\d+(\.\d+)?\s*(ms|s)$", lines[i].strip()):
                        i += 1

                if current_lines:
                    text = " ".join(current_lines).strip()
                    text = self._clean_text(text)
                    if text:
                        if marker == "ASR":
                            speaker = "human"
                        else:
                            speaker = "ai"  # LLM and TTS both indicate AI speech
                        turns.append({
                            "speaker": speaker,
                            "index": turn_index,
                            "text": text,
                            "timestamp": current_timestamp or "",
                        })
                        turn_index += 1
                    current_lines = []
                continue

            # Stage label
            if re.match(r"^Level\s+\d+", line, re.IGNORECASE):
                continue

            # Regular content
            current_lines.append(line)

        # Trailing text
        if current_lines:
            text = " ".join(current_lines).strip()
            text = self._clean_text(text)
            if text:
                turns.append({
                    "speaker": "ai",
                    "index": turn_index,
                    "text": text,
                    "timestamp": current_timestamp or "",
                })

        return turns

    def _clean_text(self, text: str) -> str:
        text = self.NOISE_PATTERN.sub("", text)
        text = self.FILLER_SOUNDS.sub("", text)
        text = self.MOOD_TAG.sub("", text)
        text = self.ELLIPSIS_ARTIFACTS.sub("", text)
        text = re.sub(r"\s{2,}", " ", text)
        text = re.sub(r"\s+([.,!?])", r"\1", text)
        text = text.strip(" -–—.")
        return text.strip()

    def _extract_metadata(self, turns: list[dict]) -> dict:
        meta = {}
        all_text = " ".join(t["text"] for t in turns[:15])
        human_turns_early = [t for t in turns[:15] if t["speaker"] == "human"]
        human_text = " ".join(t["text"] for t in human_turns_early)

        # Name extraction:
        # 1. "My name is X"
        name_m = re.search(r"[Mm]y name is (\w+)", all_text)
        if name_m:
            meta["name"] = name_m.group(1).title()
        else:
            # 2. AI says "What is your name?" and next human turn is just a name
            # Look for the first human turn that's 1-3 words (likely just their name)
            for t in human_turns_early[:3]:
                words = t["text"].strip().rstrip(".!").split()
                if 1 <= len(words) <= 3 and words[0][0].isupper():
                    # Check if AI previously asked for name
                    idx = t["index"]
                    prev_ai = [at for at in turns if at["speaker"] == "ai" and at["index"] < idx]
                    if prev_ai and re.search(r"(your name|who are you)", prev_ai[-1]["text"], re.IGNORECASE):
                        meta["name"] = words[0].title()
                        break

        # Handle "class ten/eleven/twelve", "grade twelve", "12", etc.
        class_m = re.search(r"(?:class|grade)\s*(ten|eleven|twelve|10|11|12)", all_text, re.IGNORECASE)
        if not class_m:
            class_m = re.search(r"\b(ten|eleven|twelve)\b", all_text, re.IGNORECASE)
        if class_m:
            meta["class"] = class_m.group(1).title()

        # Handle quoted motions: "Social media does more harm than good"
        # and unquoted: motion is: examinations should be abolished
        motion_m = re.search(r'motion[^"]*["\u201c]([^"\u201d]+)["\u201d]', all_text, re.IGNORECASE)
        if not motion_m:
            motion_m = re.search(r"motion is:\s*(.+?)(?:\.|Would|$)", all_text, re.IGNORECASE)
        if motion_m:
            meta["motion"] = motion_m.group(1).strip().rstrip(".")

        # Detect side — look at human turns for explicit side choice
        if re.search(r"argue\s+against", human_text, re.IGNORECASE):
            meta["side"] = "Against"
        elif re.search(r"(argue\s+for|for the (topic|motion))", human_text, re.IGNORECASE):
            meta["side"] = "For"
        # Fallback: if AI says "I will be arguing Against" then human is "For" and vice versa
        if "side" not in meta:
            ai_text = " ".join(t["text"] for t in turns[:15] if t["speaker"] == "ai")
            if re.search(r"I will (?:be )?argu(?:e|ing) against", ai_text, re.IGNORECASE):
                meta["side"] = "For"
            elif re.search(r"I will (?:be )?argu(?:e|ing) for", ai_text, re.IGNORECASE):
                meta["side"] = "Against"

        return meta


# ─────────────────────────────────────────────────────────────────────
# 2. KEYWORD / PATTERN DICTIONARIES
# ─────────────────────────────────────────────────────────────────────

EVIDENCE_KEYWORDS = [
    "according to", "research shows", "studies show", "data suggests",
    "evidence indicates", "statistics show", "survey", "report",
    "published", "percent", "study", "experiment", "analysis",
    "finding", "journal", "source", "cited", "reference",
    "example", "instance", "case study", "demonstrated",
]

LOGICAL_CONNECTORS = [
    "therefore", "consequently", "thus", "hence", "because",
    "since", "as a result", "it follows that", "this means",
    "which leads to", "given that", "due to", "owing to",
    "implies", "so", "accordingly", "for this reason",
]

HEDGING_WORDS = [
    "maybe", "perhaps", "i think", "i guess", "sort of",
    "kind of", "probably", "might", "possibly", "i feel like",
    "i believe", "not sure", "i suppose",
]

FILLER_WORDS = [
    " um ", " uh ", " like ", "you know", "basically", "literally",
    "actually", " right ", "so yeah", "i mean", " well ",
]

REBUTTAL_INDICATORS = [
    "however", "but", "on the contrary", "that's not accurate",
    "i disagree", "that ignores", "the problem with that",
    "while that may be true", "that argument fails",
    "counterpoint", "in contrast", "conversely",
    "that doesn't hold", "you're overlooking", "that's a misconception",
    "not necessarily", "that's misleading",
]

CONCESSION_INDICATORS = [
    "i agree that", "you make a good point", "that's fair",
    "i concede", "you're right that", "i acknowledge",
    "granted", "admittedly", "fair enough", "i'll give you that",
    "i apologize",
]

FALLACY_PATTERNS = {
    "Ad Hominem": [
        r"you('re|\s+are)\s+(stupid|dumb|ignorant|wrong|crazy|naive|clueless)",
        r"people like you",
        r"what do you know about",
    ],
    "Straw Man": [
        r"so (you're|you are) saying",
        r"what you('re|\s+are) really saying",
    ],
    "Appeal to Tradition": [
        r"(that's|it's|this is) (the|how the) (system|way) (we|that|things)",
        r"(we('ve| have)|it has) always",
        r"that's how it('s| is| has) (always )?(been|done|worked)",
    ],
    "Appeal to Emotion": [
        r"think of the children",
        r"how would you feel if",
    ],
    "False Dichotomy": [
        r"either\s+.{5,}\s+or\s+",
        r"there('s| is) only two",
    ],
    "Circular Reasoning": [
        r"because it('s| is) (true|right|correct|obvious)",
        r"it('s| is) true because",
    ],
    "Appeal to Authority (weak)": [
        r"everyone knows",
        r"most people (agree|think|believe)",
        r"it's common (sense|knowledge)",
    ],
}

PERSUASION_TECHNIQUES = {
    "Rhetorical Question": [
        r"(isn't|aren't|don't|doesn't|won't|can't|shouldn't|wouldn't)\s+.{5,}\?",
        r"who (would|could|wouldn't|doesn't)\s+.+\?",
        r"how (can|could) (we|you|anyone)\s+.+\?",
    ],
    "Analogy/Metaphor": [
        r"(it's|this is|life is) like",
        r"similar to",
        r"just as .+ so too",
        r"think of it as",
        r"suppose if",
    ],
    "Concrete Example": [
        r"for example",
        r"for instance",
        r"as an illustration",
        r"suppose if",
        r"say,? for example",
    ],
    "Statistical Reference": [
        r"\d+(\.\d+)?\s*%",
        r"\d+\s+out of\s+\d+",
    ],
    "Call to Action": [
        r"we (need|must|should|have to|ought to)",
        r"(let's|let us)",
    ],
    "Signposting": [
        r"(my|the) (claim|stance|position|argument) is",
        r"(this|that) (would be|is) (the end|my)",
        r"over to you",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# 3. ANALYSIS HELPERS
# ─────────────────────────────────────────────────────────────────────

def count_keyword_hits(text: str, keywords: list[str]) -> int:
    text_lower = text.lower()
    return sum(1 for kw in keywords if kw in text_lower)


def detect_patterns(text: str, pattern_dict: dict[str, list[str]]) -> list[dict]:
    found = []
    text_lower = text.lower()
    for name, patterns in pattern_dict.items():
        for pat in patterns:
            m = re.search(pat, text_lower)
            if m:
                found.append({"name": name, "match": m.group(0).strip()})
                break
    return found


def vocabulary_richness(text: str) -> float:
    words = re.findall(r"[a-z']+", text.lower())
    if not words:
        return 0.0
    return len(set(words)) / len(words)


def avg_sentence_length(text: str) -> float:
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip().split()) > 2]
    if not sentences:
        return 0.0
    return sum(len(s.split()) for s in sentences) / len(sentences)


def word_count(text: str) -> int:
    return len(text.split())


def count_disfluencies(text: str) -> dict:
    stutters = len(re.findall(r"\b(\w+)-+\1", text, re.IGNORECASE))
    restarts = len(re.findall(r"\b(\w+)-+\s", text))
    false_starts = len(re.findall(r"(to,\s+to|it,\s+it|the,\s+the)", text, re.IGNORECASE))
    repetitions = len(re.findall(r"\b(\w{2,})\s+\1\b", text, re.IGNORECASE))
    trailing = len(re.findall(r"\.\.\.", text))

    return {
        "stutters": stutters,
        "restarts": restarts,
        "false_starts": false_starts,
        "word_repetitions": repetitions,
        "trailing_off": trailing,
        "total": stutters + restarts + false_starts + repetitions + trailing,
    }


def detect_self_contradiction(turns: list[dict]) -> list[str]:
    contradictions = []
    for i, t in enumerate(turns):
        text = t["text"].lower()
        if re.search(r"(apologize|sorry) for the confusion", text):
            contradictions.append(f"Turn {i+1}: Acknowledged arguing for the wrong side.")
        if re.search(r"(wait|no),?\s*(actually|i meant)", text):
            contradictions.append(f"Turn {i+1}: Self-correction mid-argument.")
    return contradictions


# ─────────────────────────────────────────────────────────────────────
# 4. SCORING ENGINE — HUMAN DEBATER ONLY
# ─────────────────────────────────────────────────────────────────────

@dataclass
class CategoryScore:
    name: str
    score: float
    max_score: float = 10.0
    weight: float = 1.0
    details: str = ""
    sub_scores: dict = field(default_factory=dict)


class ScoringEngine:
    """
    Scores the human debater across 8 categories.

    Categories & Weights:
        1. Argument Quality        (×2.0)
        2. Rebuttal & Engagement   (×2.0)
        3. Clarity & Coherence     (×1.5)
        4. Speech Fluency          (×1.0)
        5. Persuasiveness          (×1.5)
        6. Knowledge & Evidence    (×1.5)
        7. Respectfulness & Tone   (×1.0)
        8. Consistency & Position  (×1.5)
    """

    CATEGORY_WEIGHTS = {
        "Argument Quality": 2.0,
        "Rebuttal & Engagement": 2.0,
        "Clarity & Coherence": 1.5,
        "Speech Fluency": 1.0,
        "Persuasiveness": 1.5,
        "Knowledge & Evidence": 1.5,
        "Respectfulness & Tone": 1.0,
        "Consistency & Position": 1.5,
    }

    def score(self, parsed: dict) -> dict:
        human_turns = parsed["human_turns"]
        ai_turns = parsed["ai_turns"]

        if not human_turns:
            return {"error": "No human turns found in transcript."}

        substantive_turns = [t for t in human_turns if word_count(t["text"]) > 8]
        all_turns_text = [t["text"] for t in human_turns]
        substantive_texts = [t["text"] for t in substantive_turns]
        combined = " ".join(all_turns_text)
        combined_substantive = " ".join(substantive_texts)

        total_words = word_count(combined)
        sub_words = word_count(combined_substantive)
        num_sub = len(substantive_turns)
        categories = []

        # ─── DURATION-ADAPTIVE HELPERS ───
        # Use density (per 100 words) instead of raw counts so scoring
        # stays fair whether the debate is 30 seconds or 3 hours.

        def density(raw_count: int, base_words: int = 0) -> float:
            """Hits per 100 words. Uses sub_words by default."""
            w = base_words if base_words else sub_words
            if w == 0:
                return 0.0
            return raw_count / w * 100

        def density_score(raw_count: int, per_100_thresholds: list, base_words: int = 0) -> float:
            """
            Map a density value to a 0-10 score using thresholds.
            per_100_thresholds: [(density, score), ...] sorted ascending.
            Linearly interpolates between thresholds.
            """
            d = density(raw_count, base_words)
            if not per_100_thresholds:
                return 0.0
            if d <= per_100_thresholds[0][0]:
                return per_100_thresholds[0][1]
            if d >= per_100_thresholds[-1][0]:
                return per_100_thresholds[-1][1]
            for j in range(len(per_100_thresholds) - 1):
                d0, s0 = per_100_thresholds[j]
                d1, s1 = per_100_thresholds[j + 1]
                if d0 <= d <= d1:
                    t = (d - d0) / (d1 - d0) if d1 != d0 else 0
                    return s0 + t * (s1 - s0)
            return per_100_thresholds[-1][1]

        # For vocabulary richness on long texts, use chunked TTR
        # (average TTR across 200-word windows) which stays stable at any length
        def chunked_vocabulary_richness(text: str, window: int = 200) -> float:
            words = re.findall(r"[a-z']+", text.lower())
            if len(words) <= window:
                return len(set(words)) / max(1, len(words))
            # Sliding window average
            ttrs = []
            for start in range(0, len(words) - window + 1, window // 2):
                chunk = words[start:start + window]
                ttrs.append(len(set(chunk)) / len(chunk))
            return sum(ttrs) / len(ttrs) if ttrs else 0.0

        # ── INSUFFICIENT DATA GATE ──
        # If the debater said fewer than 15 words total, there's not enough
        # speech to meaningfully score. Return a minimal report.
        if total_words < 15:
            return self._insufficient_data_report(parsed, human_turns, total_words)

        # ── 1. ARGUMENT QUALITY ──
        evidence_count = count_keyword_hits(combined_substantive, EVIDENCE_KEYWORDS)
        logic_count = count_keyword_hits(combined_substantive, LOGICAL_CONNECTORS)
        hedging_count = count_keyword_hits(combined_substantive, HEDGING_WORDS)

        # Density-based: evidence per 100 words
        # 0 density → 0, ~1.5/100 → 5, ~3/100 → 8, ~5/100 → 10
        evidence_d = density_score(evidence_count, [(0, 0), (0.8, 3), (1.5, 5), (3, 8), (5, 10)])
        logic_d = density_score(logic_count, [(0, 0), (0.5, 2), (1.0, 4), (2, 7), (3, 10)])
        hedging_d = density(hedging_count)

        arg_score = min(10, (evidence_d * 0.5) + (logic_d * 0.5))
        hedging_penalty = min(3, hedging_d * 0.3)
        arg_score = max(0, arg_score - hedging_penalty)

        avg_turn_words = total_words / max(1, num_sub)
        if avg_turn_words > 60:
            arg_score = min(10, arg_score + 1.5)
        elif avg_turn_words > 40:
            arg_score = min(10, arg_score + 0.8)
        elif avg_turn_words < 15:
            arg_score = max(0, arg_score - 1.5)

        wrong_side = any("apologize" in t["text"].lower() and "confusion" in t["text"].lower() for t in human_turns)
        if wrong_side:
            arg_score = max(0, arg_score - 2.0)

        categories.append(CategoryScore(
            name="Argument Quality", score=round(arg_score, 1),
            weight=self.CATEGORY_WEIGHTS["Argument Quality"],
            details=f"Evidence: {evidence_count} ({density(evidence_count):.1f}/100w), Logic: {logic_count} ({density(logic_count):.1f}/100w), Hedging: {hedging_count}, Avg turn: {avg_turn_words:.0f} words" +
                    (" | ⚠ Argued wrong side initially" if wrong_side else ""),
            sub_scores={"evidence": evidence_count, "logic": logic_count, "hedging": hedging_count,
                        "avg_turn_words": round(avg_turn_words), "wrong_side": wrong_side,
                        "evidence_density": round(density(evidence_count), 2),
                        "logic_density": round(density(logic_count), 2)},
        ))

        # ── 2. REBUTTAL & ENGAGEMENT ──
        rebuttal_count = count_keyword_hits(combined_substantive, REBUTTAL_INDICATORS)
        concession_count = count_keyword_hits(combined_substantive, CONCESSION_INDICATORS)

        engagement_phrases = count_keyword_hits(combined_substantive, [
            "you said", "you mentioned", "your point", "your argument",
            "you claimed", "as you stated", "you suggested",
        ])

        ai_questions = sum(1 for t in ai_turns if "?" in t["text"])

        # Density-based rebuttal scoring
        reb_d = density_score(rebuttal_count, [(0, 0), (0.5, 3), (1.0, 5), (2.0, 8), (3, 10)])
        engage_d = density_score(engagement_phrases, [(0, 0), (0.3, 2), (0.8, 5), (1.5, 8)])
        reb_score = min(10, (reb_d * 0.6) + (engage_d * 0.3) + min(1.5, concession_count * 0.4))

        if ai_questions > 3 and engagement_phrases == 0:
            reb_score = max(0, reb_score - 2.0)

        categories.append(CategoryScore(
            name="Rebuttal & Engagement", score=round(reb_score, 1),
            weight=self.CATEGORY_WEIGHTS["Rebuttal & Engagement"],
            details=f"Rebuttals: {rebuttal_count} ({density(rebuttal_count):.1f}/100w), Engagement: {engagement_phrases}, Concessions: {concession_count}, AI questions: {ai_questions}",
            sub_scores={"rebuttals": rebuttal_count, "engagement": engagement_phrases,
                        "concessions": concession_count, "ai_questions": ai_questions,
                        "rebuttal_density": round(density(rebuttal_count), 2)},
        ))

        # ── 3. CLARITY & COHERENCE ──
        vocab = chunked_vocabulary_richness(combined_substantive)
        avg_sent = avg_sentence_length(combined_substantive)
        filler_count = count_keyword_hits(combined, FILLER_WORDS)
        filler_ratio = filler_count / max(1, total_words) * 100

        clarity_score = 5.0
        # Vocabulary: chunked TTR stays stable across lengths
        if vocab > 0.55:
            clarity_score += 1.5
        elif vocab > 0.45:
            clarity_score += 0.8
        elif vocab < 0.3:
            clarity_score -= 1.5

        if 12 <= avg_sent <= 25:
            clarity_score += 1.5
        elif avg_sent > 35:
            clarity_score -= 1.5
        elif avg_sent < 8:
            clarity_score -= 1.0

        # Filler penalty based on ratio (works at any length)
        if filler_ratio > 5:
            clarity_score -= 3.0
        elif filler_ratio > 3:
            clarity_score -= 2.0
        elif filler_ratio > 1.5:
            clarity_score -= 1.0

        # Run-on penalty: ratio of run-on sentences to total sentences
        all_sentences = [s.strip() for s in re.split(r"[.!?]+", combined_substantive) if len(s.strip().split()) > 2]
        very_long_sentences = len([s for s in all_sentences if len(s.split()) > 40])
        if all_sentences:
            runon_ratio = very_long_sentences / len(all_sentences)
            clarity_score -= min(2, runon_ratio * 5)

        clarity_score = max(0, min(10, clarity_score))
        categories.append(CategoryScore(
            name="Clarity & Coherence", score=round(clarity_score, 1),
            weight=self.CATEGORY_WEIGHTS["Clarity & Coherence"],
            details=f"Vocabulary: {vocab:.2f}, Avg sentence: {avg_sent:.1f} words, Fillers: {filler_count} ({filler_ratio:.1f}%), Run-ons: {very_long_sentences}/{len(all_sentences)} sentences",
            sub_scores={"vocabulary_richness": round(vocab, 3), "avg_sentence_length": round(avg_sent, 1),
                        "filler_count": filler_count, "filler_ratio": round(filler_ratio, 2),
                        "run_on_sentences": very_long_sentences, "total_sentences": len(all_sentences)},
        ))

        # ── 4. SPEECH FLUENCY ──
        disf = count_disfluencies(combined)
        disf_density = density(disf["total"], total_words)

        fluency_score = 8.0
        # Use density for disfluencies so a 3-hour debate with 10 stutters
        # isn't penalized the same as a 2-minute debate with 10 stutters
        if disf_density > 3.0:
            fluency_score -= 4.0  # Very disfluent
        elif disf_density > 2.0:
            fluency_score -= 3.0
        elif disf_density > 1.0:
            fluency_score -= 2.0
        elif disf_density > 0.5:
            fluency_score -= 1.0

        # Incomplete turns: ratio-based
        incomplete_turns = sum(1 for t in human_turns if word_count(t["text"]) <= 5
                               and t["index"] > 2)
        total_expected_turns = sum(1 for t in human_turns if t["index"] > 2)
        if total_expected_turns > 0:
            incomplete_ratio = incomplete_turns / total_expected_turns
            if incomplete_ratio > 0.5:
                fluency_score -= 4.0
            elif incomplete_ratio > 0.3:
                fluency_score -= 2.5
            elif incomplete_ratio > 0.1:
                fluency_score -= 1.5

        # Low participation penalty
        if len(human_turns) > 0:
            non_substantive_ratio = 1 - (num_sub / len(human_turns))
            if non_substantive_ratio > 0.6:
                fluency_score -= 3.0
            elif non_substantive_ratio > 0.4:
                fluency_score -= 1.5

        fluency_score = max(0, min(10, fluency_score))
        categories.append(CategoryScore(
            name="Speech Fluency", score=round(fluency_score, 1),
            weight=self.CATEGORY_WEIGHTS["Speech Fluency"],
            details=f"Disfluencies: {disf['total']} ({disf_density:.1f}/100w), Incomplete: {incomplete_turns}/{total_expected_turns} turns, "
                    f"Stutters: {disf['stutters']}, Restarts: {disf['restarts']}, Trailing: {disf['trailing_off']}",
            sub_scores={**disf, "incomplete_turns": incomplete_turns,
                        "disfluency_density": round(disf_density, 2)},
        ))

        # ── 5. PERSUASIVENESS ──
        techniques = detect_patterns(combined_substantive, PERSUASION_TECHNIQUES)
        technique_names = list(set(t["name"] for t in techniques))

        # For long debates, look at technique variety + density, not just count
        unique_techniques = len(technique_names)
        technique_density = density(len(techniques))

        persuasion_score = min(10, (unique_techniques * 1.5) + min(3, technique_density * 1.0))

        assertion_count = logic_count + evidence_count
        if assertion_count > 0:
            confidence_ratio = max(0, 1 - (hedging_count / assertion_count))
            persuasion_score = min(10, persuasion_score + confidence_ratio * 1.5)
        else:
            confidence_ratio = 0.0

        if incomplete_turns > 0:
            persuasion_score = max(0, persuasion_score - 1.0)

        categories.append(CategoryScore(
            name="Persuasiveness", score=round(persuasion_score, 1),
            weight=self.CATEGORY_WEIGHTS["Persuasiveness"],
            details=f"Techniques: {', '.join(technique_names) if technique_names else 'None'} ({unique_techniques} types), Confidence: {confidence_ratio:.2f}",
            sub_scores={"technique_count": len(techniques), "unique_techniques": unique_techniques,
                        "techniques": technique_names, "confidence_ratio": round(confidence_ratio, 2)},
        ))

        # ── 6. KNOWLEDGE & EVIDENCE ──
        stat_refs = len(re.findall(r"\d+(\.\d+)?\s*%", combined_substantive))
        named_sources = len(re.findall(
            r"(according to|published in|reported by|study by|research from)\s+[A-Z]",
            combined_substantive, re.IGNORECASE
        ))
        specific_examples = count_keyword_hits(combined_substantive, [
            "for example", "for instance", "such as", "case in point",
            "take the case of", "consider", "look at", "as an illustration",
            "suppose if",
        ])

        # Density-based so a 3-hour debate doesn't auto-max from accumulated examples
        stats_d = density_score(stat_refs, [(0, 0), (0.2, 2), (0.5, 4), (1, 7), (2, 10)])
        sources_d = density_score(named_sources, [(0, 0), (0.1, 2), (0.3, 5), (0.8, 8), (1.5, 10)])
        examples_d = density_score(specific_examples, [(0, 0), (0.3, 2), (0.8, 5), (1.5, 8), (2.5, 10)])

        knowledge_score = min(10, (stats_d * 0.35) + (sources_d * 0.35) + (examples_d * 0.3))

        categories.append(CategoryScore(
            name="Knowledge & Evidence", score=round(knowledge_score, 1),
            weight=self.CATEGORY_WEIGHTS["Knowledge & Evidence"],
            details=f"Statistics: {stat_refs} ({density(stat_refs):.1f}/100w), Sources: {named_sources}, Examples: {specific_examples}",
            sub_scores={"stats": stat_refs, "sources": named_sources, "examples": specific_examples,
                        "stats_density": round(density(stat_refs), 2)},
        ))

        # ── 7. RESPECTFULNESS & TONE ──
        fallacies = detect_patterns(combined_substantive, FALLACY_PATTERNS)

        respect_score = 10.0
        # For long debates, a single slip shouldn't tank the score as hard
        # Use diminishing penalty: first fallacy = full penalty, subsequent = less
        ad_hominems = sum(1 for f in fallacies if f["name"] == "Ad Hominem")
        other_fallacies = len(fallacies) - ad_hominems

        if ad_hominems > 0:
            respect_score -= min(5, 3.0 + (ad_hominems - 1) * 1.0)
        if other_fallacies > 0:
            respect_score -= min(3, 1.0 + (other_fallacies - 1) * 0.5)

        respect_score += min(2, concession_count * 0.8)
        respect_score = max(0, min(10, respect_score))

        categories.append(CategoryScore(
            name="Respectfulness & Tone", score=round(respect_score, 1),
            weight=self.CATEGORY_WEIGHTS["Respectfulness & Tone"],
            details=f"Fallacies: {', '.join(f['name'] for f in fallacies) if fallacies else 'None'}, Concessions: {concession_count}",
            sub_scores={"fallacies": [{"type": f["name"], "excerpt": f["match"]} for f in fallacies],
                        "concessions": concession_count},
        ))

        # ── 8. CONSISTENCY & POSITION ──
        contradictions = detect_self_contradiction(human_turns)
        consistency_score = 8.0

        if wrong_side:
            consistency_score -= 3.0
        consistency_score -= len(contradictions) * 1.0

        # For long debates, check vocabulary consistency across halves
        if num_sub >= 4:
            half = num_sub // 2
            first_vocab = set(re.findall(r"[a-z]+", " ".join(substantive_texts[:half]).lower()))
            second_vocab = set(re.findall(r"[a-z]+", " ".join(substantive_texts[half:]).lower()))
            if first_vocab and second_vocab:
                overlap = len(first_vocab & second_vocab) / max(1, len(first_vocab | second_vocab))
                if overlap > 0.4:
                    consistency_score = min(10, consistency_score + 1.0)
                elif overlap < 0.15:
                    consistency_score = max(0, consistency_score - 2.0)

        # Can't be "consistent" if you barely said anything
        if num_sub <= 1:
            consistency_score = min(consistency_score, 3.0)
        elif num_sub <= 2:
            consistency_score = min(consistency_score, 5.0)

        consistency_score = max(0, min(10, consistency_score))
        categories.append(CategoryScore(
            name="Consistency & Position", score=round(consistency_score, 1),
            weight=self.CATEGORY_WEIGHTS["Consistency & Position"],
            details=f"Wrong side initially: {'Yes' if wrong_side else 'No'}, Self-contradictions: {len(contradictions)}, Substantive turns: {num_sub}",
            sub_scores={"wrong_side": wrong_side, "contradictions": contradictions,
                        "substantive_turns": num_sub},
        ))

        # ── OVERALL ──

        # PARTICIPATION GATE: If the debater barely participated, cap "passive" categories.
        participation_ratio = num_sub / max(1, len(human_turns))
        if num_sub <= 1 or total_words < 50:
            for c in categories:
                if c.name in ("Respectfulness & Tone",):
                    c.score = min(c.score, 6.0)
                    c.details += " | ⚠ Capped: insufficient participation to fully assess"
                if c.name in ("Speech Fluency",):
                    c.score = min(c.score, 3.0)
                    c.details += " | ⚠ Capped: too few substantive turns"

        total_weight = sum(c.weight for c in categories)
        weighted_sum = sum(c.score * c.weight for c in categories)
        overall = round(weighted_sum / total_weight, 1)
        grade = self._grade(overall)

        strengths = self._strengths(categories)
        weaknesses = self._weaknesses(categories)
        improvements = self._improvements(categories)
        key_moments = self._key_moments(human_turns)
        ai_challenges = self._summarize_ai_challenges(ai_turns)

        return {
            "debater": {
                "name": parsed.get("debater_name", "Unknown"),
                "class": parsed.get("debater_class", "Unknown"),
                "side": parsed.get("debater_side", "Unknown"),
            },
            "motion": parsed.get("motion", "Unknown"),
            "stats": {
                "total_turns": len(human_turns),
                "substantive_turns": len(substantive_turns),
                "total_words": total_words,
                "avg_words_per_turn": round(avg_turn_words),
            },
            "overall_score": overall,
            "grade": grade,
            "categories": [
                {"name": c.name, "score": c.score, "max": c.max_score,
                 "weight": c.weight, "details": c.details, "sub_scores": c.sub_scores}
                for c in categories
            ],
            "strengths": strengths,
            "weaknesses": weaknesses,
            "areas_to_improve": improvements,
            "fallacies_detected": [{"type": f["name"], "excerpt": f["match"]} for f in fallacies],
            "persuasion_techniques": technique_names,
            "disfluency_report": disf,
            "key_moments": key_moments,
            "ai_challenges_summary": ai_challenges,
        }

    def _insufficient_data_report(self, parsed: dict, human_turns: list, total_words: int) -> dict:
        """Return a minimal report when the debater barely spoke (< 15 words)."""
        return {
            "debater": {
                "name": parsed.get("debater_name", "Unknown"),
                "class": parsed.get("debater_class", "Unknown"),
                "side": parsed.get("debater_side", "Unknown"),
            },
            "motion": parsed.get("motion", "Unknown"),
            "stats": {
                "total_turns": len(human_turns),
                "substantive_turns": 0,
                "total_words": total_words,
                "avg_words_per_turn": round(total_words / max(1, len(human_turns))),
            },
            "overall_score": 0.5,
            "grade": "F",
            "insufficient_data": True,
            "insufficient_data_reason": f"Only {total_words} words spoken — not enough speech to evaluate. A minimum of ~15 words of substantive argument is needed.",
            "categories": [
                {"name": n, "score": 0, "max": 10, "weight": w, "details": "Insufficient data", "sub_scores": {}}
                for n, w in self.CATEGORY_WEIGHTS.items()
            ],
            "strengths": [],
            "weaknesses": ["Insufficient participation — the debater did not provide enough speech to evaluate."],
            "areas_to_improve": [
                "[General] Engage with the debate topic — state your position and give at least one supporting reason.",
                "[General] Aim to speak for at least 30 seconds per turn with a clear claim and supporting evidence.",
            ],
            "fallacies_detected": [],
            "persuasion_techniques": [],
            "disfluency_report": {"stutters": 0, "restarts": 0, "false_starts": 0,
                                  "word_repetitions": 0, "trailing_off": 0, "total": 0},
            "key_moments": [f"⚠ Only {total_words} words spoken across {len(human_turns)} turns — debate effectively did not occur."],
            "ai_challenges_summary": [],
        }

    def _grade(self, score: float) -> str:
        if score >= 9.0: return "A+"
        if score >= 8.5: return "A"
        if score >= 8.0: return "A-"
        if score >= 7.5: return "B+"
        if score >= 7.0: return "B"
        if score >= 6.5: return "B-"
        if score >= 6.0: return "C+"
        if score >= 5.5: return "C"
        if score >= 5.0: return "C-"
        if score >= 4.0: return "D"
        return "F"

    def _strengths(self, cats: list[CategoryScore]) -> list[str]:
        msgs = {
            "Argument Quality": "Well-structured arguments with supporting evidence and logical reasoning.",
            "Rebuttal & Engagement": "Actively engaged with opponent's points and provided strong counter-arguments.",
            "Clarity & Coherence": "Spoke clearly with good vocabulary and well-structured sentences.",
            "Speech Fluency": "Smooth, confident delivery with minimal disfluencies.",
            "Persuasiveness": "Effectively used rhetorical techniques to build a compelling case.",
            "Knowledge & Evidence": "Backed claims with concrete examples, data, or credible sources.",
            "Respectfulness & Tone": "Maintained a respectful, professional tone throughout.",
            "Consistency & Position": "Held a consistent position and stayed on-topic throughout.",
        }
        result = []
        for c in sorted(cats, key=lambda x: x.score, reverse=True):
            if c.score >= 7.0:
                result.append(f"[{c.name} — {c.score}/10] {msgs.get(c.name, 'Strong performance.')}")
        if not result:
            best = max(cats, key=lambda c: c.score)
            result.append(f"[{best.name} — {best.score}/10] {msgs.get(best.name, 'Relative strength.')}")
        return result

    def _weaknesses(self, cats: list[CategoryScore]) -> list[str]:
        msgs = {
            "Argument Quality": "Arguments lacked depth, evidence, or logical connectors. Over-relied on assertions.",
            "Rebuttal & Engagement": "Did not directly address the opponent's key challenges or questions.",
            "Clarity & Coherence": "Speech was unclear — run-on sentences, filler words, or disorganized flow.",
            "Speech Fluency": "Frequent stutters, restarts, trailing off, or incomplete responses.",
            "Persuasiveness": "Assertions lacked rhetorical force; missed opportunities to persuade.",
            "Knowledge & Evidence": "No concrete facts, statistics, or credible sources were cited.",
            "Respectfulness & Tone": "Used logical fallacies that weakened credibility.",
            "Consistency & Position": "Position shifted or contradicted itself during the debate.",
        }
        result = []
        for c in sorted(cats, key=lambda x: x.score):
            if c.score < 5.0:
                result.append(f"[{c.name} — {c.score}/10] {msgs.get(c.name, 'Needs significant improvement.')}")
        if not result:
            worst = min(cats, key=lambda c: c.score)
            result.append(f"[{worst.name} — {worst.score}/10] {msgs.get(worst.name, 'Area for growth.')}")
        return result

    def _improvements(self, cats: list[CategoryScore]) -> list[str]:
        tips = {
            "Argument Quality": [
                "State your claim clearly in one sentence before expanding — 'My position is X because Y.'",
                "Use logical connectors (therefore, because, as a result) to link your reasoning.",
                "Back every claim with at least one piece of evidence or concrete example.",
                "Develop each point fully (3+ sentences) before moving to the next.",
            ],
            "Rebuttal & Engagement": [
                "Directly quote or paraphrase the opponent: 'You said X, but I counter that…'",
                "When the opponent asks a direct question, answer it head-on before pivoting.",
                "Use counter-examples to dismantle the opponent's claims.",
                "Acknowledge valid opposing points — it strengthens your credibility before you counter.",
            ],
            "Clarity & Coherence": [
                "Eliminate filler words (um, uh, basically, like) — pause silently instead.",
                "Structure each response: Claim → Evidence → Impact. Don't meander.",
                "Keep sentences between 12-25 words. Break long chains into shorter statements.",
                "Avoid starting multiple sentences the same way — vary your openings.",
            ],
            "Speech Fluency": [
                "Practice slowing down — a deliberate pause is stronger than a stutter.",
                "If you lose your train of thought, summarize what you've said so far to reset.",
                "Finish every sentence. Trailing off signals uncertainty to judges.",
                "Record yourself debating and listen back to spot disfluency patterns.",
            ],
            "Persuasiveness": [
                "Use rhetorical questions to make the audience think: 'Can we afford to ignore this?'",
                "Draw analogies to make abstract points tangible and relatable.",
                "End each turn with your strongest point, not your weakest.",
                "Vary your delivery: use emphasis, pauses, and pacing for key points.",
            ],
            "Knowledge & Evidence": [
                "Prepare 3-5 specific facts, statistics, or case studies before the debate.",
                "Name your sources: 'A 2024 UNESCO report found…' beats vague 'studies show'.",
                "Use real-world examples from multiple countries or contexts to show breadth.",
                "When the opponent cites data, challenge its methodology or offer counter-data.",
            ],
            "Respectfulness & Tone": [
                "Attack arguments, not the person. Replace 'you're wrong' with 'that reasoning overlooks…'",
                "Avoid appeal to tradition ('that's just how the system works') — justify on merit.",
                "When you agree with a point, say so — it shows confidence, not weakness.",
                "Stay calm and measured even when challenged aggressively.",
            ],
            "Consistency & Position": [
                "Before speaking, confirm which side you're on — don't accidentally argue for the opponent.",
                "Keep a mental thread: Opening claim → Each response reinforces that claim.",
                "If you need to adjust your position, frame it as refinement, not reversal.",
                "Connect every new point back to your central thesis.",
            ],
        }
        result = []
        for c in sorted(cats, key=lambda x: x.score):
            if c.score >= 8.5:
                continue
            cat_tips = tips.get(c.name, [])
            if cat_tips:
                n = min(2, max(1, int((10 - c.score) / 3)))
                for tip in cat_tips[:n]:
                    result.append(f"[{c.name}] {tip}")
            if len(result) >= 8:
                break
        return result

    def _key_moments(self, turns: list[dict]) -> list[str]:
        moments = []
        for t in turns:
            idx = t["index"] + 1
            text = t["text"]
            wc = word_count(text)

            if wc <= 3 and t["index"] > 2:
                moments.append(f"Turn {idx}: ⚠ Incomplete/empty response — lost opportunity.")
                continue

            if count_keyword_hits(text, EVIDENCE_KEYWORDS) >= 3:
                moments.append(f"Turn {idx}: ✓ Strong evidence-backed argument.")
            if count_keyword_hits(text, REBUTTAL_INDICATORS) >= 2:
                moments.append(f"Turn {idx}: ✓ Effective rebuttal.")
            if count_keyword_hits(text, CONCESSION_INDICATORS) >= 1:
                moments.append(f"Turn {idx}: ✓ Showed intellectual honesty with a concession.")

            fallacies = detect_patterns(text, FALLACY_PATTERNS)
            if fallacies:
                names = ", ".join(set(f["name"] for f in fallacies))
                moments.append(f"Turn {idx}: ⚠ Potential fallacy ({names}).")

            if "apologize" in text.lower() and "confusion" in text.lower():
                moments.append(f"Turn {idx}: ⚠ Side-confusion correction — cost credibility.")

        return moments[:12]

    def _summarize_ai_challenges(self, ai_turns: list[dict]) -> list[str]:
        # Skip procedural / setup questions
        PROCEDURAL_KEYWORDS = [
            "what is your name", "which class", "what class",
            "shall i propose", "do you have one", "argue for or against",
            "would you like to argue", "shall we proceed",
            "would you like to continue", "you may begin",
            "please proceed", "please begin",
        ]
        challenges = []
        for t in ai_turns:
            questions = re.findall(r"([^.!]*\?)", t["text"])
            for q in questions:
                q = q.strip().strip('"').strip()
                if len(q.split()) < 8:
                    continue
                # Skip procedural
                q_lower = q.lower()
                if any(pk in q_lower for pk in PROCEDURAL_KEYWORDS):
                    continue
                challenges.append(q)
        return challenges[:8]


# ─────────────────────────────────────────────────────────────────────
# 5. MAIN JUDGE CLASS
# ─────────────────────────────────────────────────────────────────────

class DebateJudge:
    """
    Main interface. Accepts raw ElevenLabs transcript, returns judging report.

    Usage:
        judge = DebateJudge()
        print(judge.judge(transcript_text))                          # text report
        data = judge.judge(transcript_text, output_format="dict")    # dict for API
        json_str = judge.judge(transcript_text, output_format="json") # JSON
    """

    def __init__(self):
        self.parser = ElevenLabsParser()
        self.engine = ScoringEngine()

    def judge(self, raw_transcript: str, output_format: str = "text") -> str | dict:
        parsed = self.parser.parse(raw_transcript)

        if not parsed["human_turns"]:
            msg = "No human speech turns found in the transcript."
            return {"error": msg} if output_format == "dict" else msg

        result = self.engine.score(parsed)

        if output_format == "dict":
            return result
        elif output_format == "json":
            return json.dumps(result, indent=2, ensure_ascii=False)
        else:
            return self._format_report(result)

    def judge_file(self, filepath: str, output_format: str = "text") -> str | dict:
        with open(filepath, "r", encoding="utf-8") as f:
            return self.judge(f.read(), output_format)

    def _format_report(self, r: dict) -> str:
        lines = []
        lines.append("=" * 72)
        lines.append("  DEBATE JUDGE — PERFORMANCE REPORT")
        lines.append("=" * 72)

        d = r["debater"]
        lines.append(f"\n  Debater:  {d['name']}")
        lines.append(f"  Class:    {d['class']}")
        lines.append(f"  Motion:   \"{r['motion']}\"")
        lines.append(f"  Side:     {d['side']} the motion")

        s = r["stats"]
        lines.append(f"\n  Turns: {s['total_turns']} ({s['substantive_turns']} substantive)")
        lines.append(f"  Words: {s['total_words']} (avg {s['avg_words_per_turn']}/turn)")

        lines.append(f"\n  ┌─────────────────────────────────────────┐")
        lines.append(f"  │  OVERALL SCORE:  {r['overall_score']:>4}/10   Grade: {r['grade']:<4}  │")
        lines.append(f"  └─────────────────────────────────────────┘")

        lines.append("\n  CATEGORY SCORES:")
        lines.append("  " + "─" * 68)
        for c in r["categories"]:
            bar_filled = int(c["score"])
            bar_empty = 10 - bar_filled
            bar = "█" * bar_filled + "░" * bar_empty
            lines.append(f"    {c['name']:<25} {bar}  {c['score']:>4}/10  (×{c['weight']})")
            lines.append(f"      {c['details']}")
        lines.append("  " + "─" * 68)

        lines.append("\n  ✓ STRENGTHS:")
        for s_ in r["strengths"]:
            lines.append(f"    {s_}")

        lines.append("\n  ✗ WEAKNESSES:")
        for w in r["weaknesses"]:
            lines.append(f"    {w}")

        if r["fallacies_detected"]:
            lines.append("\n  ⚠ FALLACIES DETECTED:")
            for f in r["fallacies_detected"]:
                lines.append(f"    • {f['type']}: \"{f['excerpt']}\"")

        if r["persuasion_techniques"]:
            lines.append(f"\n  PERSUASION TECHNIQUES: {', '.join(r['persuasion_techniques'])}")

        dr = r["disfluency_report"]
        if dr["total"] > 0:
            lines.append(f"\n  SPEECH DISFLUENCIES:")
            lines.append(f"    Stutters: {dr['stutters']}  |  Restarts: {dr['restarts']}  |  "
                         f"Repetitions: {dr['word_repetitions']}  |  Trailing off: {dr['trailing_off']}")

        lines.append("\n  KEY MOMENTS:")
        for m in r["key_moments"]:
            lines.append(f"    {m}")

        lines.append("\n  📋 AREAS TO IMPROVE:")
        for i, tip in enumerate(r["areas_to_improve"], 1):
            lines.append(f"    {i}. {tip}")

        if r["ai_challenges_summary"]:
            lines.append("\n  OPPONENT'S KEY CHALLENGES (review these):")
            for i, q in enumerate(r["ai_challenges_summary"], 1):
                lines.append(f"    {i}. {q}")

        lines.append("\n" + "=" * 72)
        lines.append("  END OF REPORT")
        lines.append("=" * 72)

        return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────
# 6. CLI
# ─────────────────────────────────────────────────────────────────────

def main():
    import sys
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        fmt = sys.argv[2] if len(sys.argv) > 2 else "text"
        judge = DebateJudge()
        print(judge.judge_file(filepath, output_format=fmt))
    else:
        print("Usage: python debate_judge.py <transcript_file> [text|json|dict]")
        print("       Provide an ElevenLabs transcript file as the first argument.")


if __name__ == "__main__":
    main()
