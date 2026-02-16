import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, showNumber = true, size = 'sm' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            className={`${iconSize} fill-yellow-400 text-yellow-400`}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${iconSize} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            className={`${iconSize} text-gray-300`}
          />
        ))}
      </div>
      {showNumber && (
        <span className={`${textSize} text-[var(--text-secondary)] font-medium`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
