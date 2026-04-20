/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

export type AudioState = 'stopped' | 'loading' | 'playing' | 'paused';

export async function speakWithGenAI(text: string, onEnd: () => void) {
  try {
    // If already paused, just resume
    if (audioContext && audioContext.state === 'suspended' && currentSource) {
      await audioContext.resume();
      return;
    }

    // Otherwise load new
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Please read this news article in a professional and clear broadcast voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      onEnd();
      return;
    }

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const sampleRate = 24000;
    const pcmData = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Data);

    currentSource = audioContext.createBufferSource();
    currentSource.buffer = audioBuffer;
    currentSource.connect(audioContext.destination);
    currentSource.onended = () => {
      // If we are stopped manually, don't trigger the "natural" end
      if (currentSource) {
        currentSource = null;
        onEnd();
      }
    };
    currentSource.start();
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    onEnd();
  }
}

export function pauseGenAISpeak() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

export function resumeGenAISpeak() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

export function stopGenAISpeak() {
  if (currentSource) {
    const src = currentSource;
    currentSource = null; // Prevent onended from firing with onEnd() callback
    src.stop();
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume(); // Ensure context is clean
  }
}
