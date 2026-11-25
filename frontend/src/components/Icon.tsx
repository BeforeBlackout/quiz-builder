type IconProps = {
  src: string;
  alt?: string;
  className?: string;
};

export function Icon({ src, alt = "", className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Figma SVGs keep their own width/height
    <img src={src} alt={alt} className={className} />
  );
}
