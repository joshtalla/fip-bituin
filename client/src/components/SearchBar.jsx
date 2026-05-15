import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";

function SearchBar({
  initialValue = "",
  value,
  onChange,
  onSearch,
  placeholder = "Search posts...",
  formClassName = "",
  inputClassName = "",
  buttonClassName = "",
  autoFocus = false,
}) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(initialValue);
    }
  }, [initialValue, isControlled]);

  const handleChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onChange?.(event);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedValue = currentValue.trim();

    if (!trimmedValue) return;

    onSearch(trimmedValue);
  };

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <input
        type="text"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        className={inputClassName}
      />

      <button type="submit" className={buttonClassName} aria-label="Search">
        <CiSearch />
      </button>
    </form>
  );
}

export default SearchBar;