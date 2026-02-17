import React, { forwardRef, InputHTMLAttributes } from "react";

type CoolInputProps = {
  title: string;
  error?: string;
  wrapperClass?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const CoolInput = forwardRef<HTMLInputElement, CoolInputProps>(
  ({ title, error, wrapperClass, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;

    return (
      <div className={`flex flex-col max-w-60 ${wrapperClass ?? ""}`}>
        <label
          htmlFor={inputId}
          className="text-[#283df5] relative top-3 mr-2 px-2 bg-white w-fit"
        >
          {title}
        </label>

        <input
          ref={ref} // ✅ مهم برای RHF
          id={inputId}
          {...rest} // ✅ همه props register
          className={`
            p-3 border-2 rounded-md bg-white focus:outline-none
            ${error ? "border-red-500" : "border-[#3447f7]"}
            ${className ?? ""}
          `}
        />

        {error && (
          <span className="text-red-600 text-sm mt-1 mr-1">{error}</span>
        )}
      </div>
    );
  },
);

CoolInput.displayName = "CoolInput";
export default CoolInput;
