'use client';

import { Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import {
  shouldShowScoreSubmitForm,
  formatSubmitButtonText,
} from '@/utils/victoryModalUtils';

interface VictoryScoreSubmitFormProps {
  levelId: number;
  playerName: string;
  scoreSubmitted: boolean;
  onPlayerNameChange: (name: string) => void;
  onScoreSubmit: (e: React.FormEvent) => void;
}

/**
 * Zafer modalında liderlik tablosu puan gönderim formu
 */
export function VictoryScoreSubmitForm({
  levelId,
  playerName,
  scoreSubmitted,
  onPlayerNameChange,
  onScoreSubmit,
}: VictoryScoreSubmitFormProps) {
  if (!shouldShowScoreSubmitForm(levelId)) {
    return null;
  }

  const buttonText = formatSubmitButtonText(scoreSubmitted);

  return (
    <form
      onSubmit={onScoreSubmit}
      className="mt-5 flex gap-2 rounded-2xl border border-line bg-surface-2/60 p-1.5"
    >
      <input
        type="text"
        maxLength={24}
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
        disabled={scoreSubmitted}
        aria-label="Oyuncu adı"
        placeholder="Oyuncu adın"
        className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium text-fg placeholder:text-muted/60 outline-none disabled:text-muted"
      />
      <Button
        type="submit"
        variant={scoreSubmitted ? 'secondary' : 'primary'}
        size="sm"
        disabled={scoreSubmitted}
        icon={
          scoreSubmitted ? (
            <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
          ) : (
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
          )
        }
      >
        {buttonText}
      </Button>
    </form>
  );
}

