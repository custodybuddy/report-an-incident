import React from 'react';
import H1 from './H1';

interface StepHeroProps {
  title: string;
  description: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageClassName?: string;
  className?: string;
}

const StepHero: React.FC<StepHeroProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  imageClassName = '',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center text-center space-y-5 max-w-3xl mx-auto ${className}`.trim()}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={imageAlt ?? ''}
          aria-hidden={imageAlt ? undefined : true}
          className={`w-36 h-24 object-contain ${imageClassName}`.trim()}
        />
      )}
      <H1 className="text-[#FFD700]">{title}</H1>
      <p className="text-slate-400 max-w-xl mx-auto">{description}</p>
    </div>
  );
};

export default StepHero;
