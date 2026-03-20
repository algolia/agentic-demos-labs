import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  src: string
  href: string
  alt?: string
  className?: string
}

export const Logo = ({
  src,
  href,
  alt = 'Logo',
  className = '',
}: LogoProps) => (
  <Link href={href} className={className}>
    <Image
      src={src}
      alt={alt}
      width={120}
      height={40}
      className="h-auto w-auto"
    />
  </Link>
)
