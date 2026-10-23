ALTER TABLE public.popups
  DROP CONSTRAINT IF EXISTS popups_variant_check;

ALTER TABLE public.popups
  ADD CONSTRAINT popups_variant_check
  CHECK (variant IN (
    'amber',
    'sky',
    'emerald',
    'rose',
    'indigo',
    'orange',
    'teal',
    'violet',
    'cyan',
    'lime',
    'pink',
    'slate'
  ));
