import React, { forwardRef } from 'react';

export const H3 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      {...props}
      className={`scroll-m-12 text-xl sm:text-2xl font-semibold text-[#F4E883] ${className}`.trim()}
    />
  )
);

H3.displayName = 'H3';

export default H3;
