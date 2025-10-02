import clsx from "clsx";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  color?: "blue" | "gray"; // Added prop to toggle color theme
}

const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className = "",
  color = "blue", // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  
  // Use controlled state if checked prop is provided, otherwise use internal state
  const isControlled = checked !== undefined;
  const checkedValue = isControlled ? checked : isChecked;

  const handleToggle = () => {
    if (disabled) return;
    
    if (isControlled) {
      // For controlled component, just call onChange
      if (onChange) {
        onChange(!checkedValue);
      }
    } else {
      // For uncontrolled component, update internal state
      const newCheckedState = !isChecked;
      setIsChecked(newCheckedState);
      if (onChange) {
        onChange(newCheckedState);
      }
    }
  };

  const switchColors =
    color === "blue"
      ? {
          background: checkedValue
            ? "bg-brand-500 "
            : "bg-gray-200", // Blue version
          knob: checkedValue
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        }
      : {
          background: checkedValue
            ? "bg-gray-800"
            : "bg-gray-200", // Gray version
          knob: checkedValue
            ? "translate-x-full bg-white"
            : "translate-x-0 bg-white",
        };

  return (
    <label
      className={clsx(
          twMerge(
              `inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
              disabled ? "text-gray-400" : "text-gray-700"
            }`,
            className,
          ),
      )}
      onClick={handleToggle} // Toggle when the label itself is clicked
    >
      <div className="relative">
        <div
          className={`block transition duration-150 ease-linear h-6 w-11 rounded-full ${
            disabled
              ? "bg-gray-100 pointer-events-none"
              : switchColors.background
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
