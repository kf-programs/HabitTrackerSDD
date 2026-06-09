import { type ReactNode, useState } from 'react';

interface CategoryAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CategoryAccordion({ title, defaultOpen = false, children }: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className="overflow-hidden rounded-3xl bg-white/80 shadow-soft">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="text-base font-semibold">{title}</span>
        <span className="text-lg text-ink/45">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen ? <div className="space-y-3 px-5 pb-5">{children}</div> : null}
    </article>
  );
}
