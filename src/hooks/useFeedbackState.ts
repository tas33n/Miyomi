import { useState } from 'react';

export function useFeedbackState() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleToggle = () => {
    setIsFeedbackOpen(prev => !prev);
  };

  const handleClose = () => {
    setIsFeedbackOpen(false);
  };

  return { isFeedbackOpen, handleToggle, handleClose };
}