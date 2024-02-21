import { INavLink } from '@/models/NavLink.model';
import { Link as UiLink } from 'evergreen-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLink = ({ children, href }: INavLink) => {
  const path = usePathname();
  return (
    <Link href={href}>
      <UiLink
        is="span"
        color={path.includes(href) ? 'default' : 'neutral'}
        fontWeight={path.includes(href) ? 500 : 400}
        textTransform="uppercase"
        letterSpacing="1px"
      >
        {children}
      </UiLink>
    </Link>
  );
};
