import React from 'react';
import { useEventContext } from '../context/EventContext';

interface Props {
  sectionKey: string;
  field?: string;
  fallbackText?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'li';
}

export const EditableText: React.FC<Props> = ({
  sectionKey,
  field = 'title',
  fallbackText = '',
  className = '',
  as: Component = 'span',
}) => {
  const { siteContent } = useEventContext();

  const section = siteContent?.[sectionKey];
  const textValue = section && section[field] !== undefined ? section[field] : fallbackText;

  return <Component className={className}>{textValue}</Component>;
};
