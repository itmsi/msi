import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const config: any = {
      mode: mode || "single",
      static: false,
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
    };

    // Time-specific configuration
    if (mode === "time") {
      config.enableTime = true;
      config.noCalendar = true;
      config.dateFormat = "H:i";
      config.time_24hr = true;
      config.minuteIncrement = 1;
      config.defaultHour = 12;
      config.defaultMinute = 0;
    } else {
      config.monthSelectorType = "static";
    }

    const flatPickr = flatpickr(`#${id}`, config);

    return () => {
      setTimeout(() => {
        if (!Array.isArray(flatPickr)) {
          flatPickr.destroy();
        }
      }, 100);
    };
  }, [mode, id]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
