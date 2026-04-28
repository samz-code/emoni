const ProcessStep = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="relative py-10 border-b border-olive/30 last:border-b-0">
      <span className="font-display text-[80px] text-olive/20 absolute -top-2 left-0 leading-none select-none">
        {number}
      </span>
      <div className="pl-0 md:pl-24 pt-8 md:pt-0">
        <h3 className="font-display text-2xl text-cream">{title}</h3>
        <p className="font-body text-[15px] text-cream/70 leading-relaxed mt-2 max-w-xl">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProcessStep;
