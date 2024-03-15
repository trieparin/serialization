import { Link as UiLink } from 'evergreen-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface NavLinkProps {
  children: ReactNode;
  href: string;
}

export const NavLink = ({ children, href }: NavLinkProps) => {
  const router = useRouter();
  return (
    <Link href={href}>
      <UiLink
        is="span"
        color={router.pathname.includes(href) ? 'default' : 'neutral'}
        fontWeight={router.pathname.includes(href) ? 500 : 400}
        textTransform="uppercase"
      >
        {children}
      </UiLink>
    </Link>
  );
};
