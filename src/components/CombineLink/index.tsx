import { ICombineLink } from '@/models/CombineLink.model';
import { Link as UiLink, minorScale } from 'evergreen-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const CombineLink = ({ children, href }: ICombineLink) => {
  const path = usePathname();
  return (
    <Link href={href}>
      <UiLink
        is="span"
        color={path === href ? 'default' : 'neutral'}
        textTransform="uppercase"
        letterSpacing="1px"
        padding={minorScale(3)}
      >
        {children}
      </UiLink>
    </Link>
  );
};
