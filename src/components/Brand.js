import React from "react";

const Brand = () => (
  <div className="flex items-center gap-3 text-[#185835]">
    <span className="grid h-11 w-11 place-items-center rounded-full border border-green-200 bg-green-50">
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.8 3.2C12.9 3.1 7.5 4.4 4.6 7.3c-2.4 2.4-2.5 5.8-.5 7.8 1.8 1.8 4.9 1.8 7.2-.1-2.1 3.4-4.7 5.2-7.1 6.1l.8 1.8c4.4-1.6 8.2-5.7 10.2-11.4 1.3-3.7 3.4-6.1 5.6-8.3ZM5.5 13.6c-.8-.8-.7-2.8.7-4.2 1.6-1.6 4.8-2.7 9.4-3.2-1.7 1.9-3 4-3.9 6.5-1.9 2.1-4.8 2.2-6.2.9Z" />
      </svg>
    </span>
    <span>
      <b className="block font-['Manrope',sans-serif] text-2xl font-extrabold leading-none">
        cegct
      </b>
      <small className="mt-1 block text-[9px] font-bold tracking-wider text-gray-500">
        GUARDIANS OF OUR ENVIRONMENT
      </small>
    </span>
  </div>
);

export default Brand;
