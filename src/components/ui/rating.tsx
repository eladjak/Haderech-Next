import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({ value, readOnly = false, onChange }: RatingProps) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(i + 1)}
          className={`${readOnly ? "" : "transition-transform hover:scale-110"}`}
        >
          <Star
            className={`h-4 w-4 ${
              i < value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
