import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_TAGS = 10;

export default function TagInput({
  tags,
  onChange,
  disabled,
  placeholder,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      setError("Tag already added");
      return;
    }

    if (tags.length >= MAX_TAGS) {
      setError(`Maximum ${MAX_TAGS} tags`);
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue("");
    setError(null);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className="tag-input">
      <div className="tag-input__list">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag-chip">
            {tag}
            {!disabled && (
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => removeTag(index)}
              >
                x
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <input
          className="tag-input__input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Type a tag and press Enter..."}
          disabled={disabled}
        />
      )}
      {error && <div className="tag-input__error">{error}</div>}
    </div>
  );
}
