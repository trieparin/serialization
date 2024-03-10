import { Link as UiLink } from 'evergreen-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavLinkProps {
  children: ReactNode;
  href: string;
}

export const NavLink = ({ children, href }: NavLinkProps) => {
  const path = usePathname();
  return (
    <Link href={href}>
      <UiLink
        is="span"
        color={path.includes(href) ? 'default' : 'neutral'}
        fontWeight={path.includes(href) ? 500 : 400}
        textTransform="uppercase"
      >
        {children}
      </UiLink>
    </Link>
  );
};
