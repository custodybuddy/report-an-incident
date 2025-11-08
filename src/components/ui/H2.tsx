import React, { forwardRef } from 'react';

export const H2 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h2
      ref={ref}
      {...props}
      className={`scroll-m-16 text-2xl sm:text-3xl font-semibold text-[#F4E883] ${className}`.trim()}
    />
  )
);

H2.displayName = 'H2';

export default H2;
