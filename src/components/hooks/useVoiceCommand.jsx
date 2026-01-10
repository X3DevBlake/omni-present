/**
 * useVoiceCommand Hook
 * Handles voice command processing
 */

import { useMutation } from '@tanstack/react-query';

export function useVoiceCommand() {
  return useMutation({
    mutationFn: async ({ userEmail, voiceInput }) => {
      const response = await fetch('/api/functions/handle-voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, voiceInput })
      });
      return response.json();
    }
  });
}