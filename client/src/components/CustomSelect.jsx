import { useState } from 'react';

function CustomSelect({ label, placeholder, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="signup-field">
      <label className="signup-label">{label}</label>

      <div className="custom-select">
        <button
          type="button"
          className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selected ? 'custom-select-value' : 'custom-select-placeholder'}>
            {selected || placeholder}
          </span>
          <span className="custom-select-arrow">{isOpen ? '⌃' : '⌄'}</span>
        </button>

        {isOpen && (
          <div className="custom-select-menu">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                className="custom-select-option"
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomSelect;