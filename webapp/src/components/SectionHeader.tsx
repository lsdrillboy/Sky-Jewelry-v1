import '../App.css';

type Props = {
  title: string;
  subtitle?: string;
  kicker?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
};

export default function SectionHeader({
  title,
  subtitle,
  kicker,
  align = 'left',
  as = 'h1',
}: Props) {
  const Heading = as;
  return (
    <div className={`section-header${align === 'center' ? ' center' : ''}`}>
      {kicker ? <div className="section-kicker">{kicker}</div> : null}
      <Heading className="section-title">{title}</Heading>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
