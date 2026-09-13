'use client';

import { useState } from 'react';

type PasswordVisibilityFieldProps = {
  label: string;
  defaultValue: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  readOnly?: boolean;
  autoComplete?: string;
  helperText?: string;
};

export default function PasswordVisibilityField({
  label,
  defaultValue,
  name,
  required,
  minLength,
  readOnly,
  autoComplete,
  helperText,
}: PasswordVisibilityFieldProps) {
  const [visible, setVisible] = useState(false);

  return <label className="grid gap-1 text-sm font-medium">
    {label}
    <span className="relative">
      <input
        name={name}
        type={visible ? 'text' : 'password'}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        readOnly={readOnly}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-stone-300 px-3 py-2.5 pr-20 font-normal"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? '隐藏密码 Hide password' : '显示密码 Show password'}
        aria-pressed={visible}
        className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-medium text-gray-600 hover:bg-stone-100"
      >
        {visible ? '隐藏' : '显示'}
      </button>
    </span>
    {helperText ? <span className="text-xs font-normal text-gray-400">{helperText}</span> : null}
  </label>;
}
