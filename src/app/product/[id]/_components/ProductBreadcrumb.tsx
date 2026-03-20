import Link from 'next/link'

interface ProductBreadcrumbProps {
  productName: string
}

export const ProductBreadcrumb = ({ productName }: ProductBreadcrumbProps) => (
  <nav className="text-muted-foreground mb-6 text-sm">
    <Link href="/ecommerce" className="hover:text-foreground">
      Home
    </Link>
    <span className="mx-2">/</span>
    <Link href="/search" className="hover:text-foreground">
      Products
    </Link>
    <span className="mx-2">/</span>
    <span className="text-foreground inline-block max-w-50 truncate align-bottom">
      {productName}
    </span>
  </nav>
)
