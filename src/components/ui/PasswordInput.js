"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({
    id,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    className = "mv-input",
}) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`${className} pr-11`}
            />
            <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-100"
                aria-label={isVisible ? "Hide password" : "Show password"}
            >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
