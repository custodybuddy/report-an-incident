import React, { forwardRef } from 'react';

export const H1 = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h1
      ref={ref}
      {...props}
      className={`scroll-m-20 text-3xl sm:text-4xl font-bold text-primary capitalize text-center ${className}`.trim()}
    />
  )
);

H1.displayName = 'H1';

export default H1;
