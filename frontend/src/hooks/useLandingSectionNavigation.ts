import { useCallback, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type LandingSectionNavigationOptions = {
  offset?: number;
  replace?: boolean;
};

export const useLandingSectionNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback((sectionId: string, options: LandingSectionNavigationOptions = {}) => {
    if (typeof window === 'undefined') return;

    const normalizedSectionId = sectionId.replace(/^#/, '');
    const offset = options.offset ?? 96;

    const performScroll = () => {
      const element = document.getElementById(normalizedSectionId);
      if (!element) return false;

      const nextTop = Math.max(window.scrollY + element.getBoundingClientRect().top - offset, 0);
      window.scrollTo({ top: nextTop, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${normalizedSectionId}`);
      return true;
    };

    if (location.pathname === '/') {
      performScroll();
      return;
    }

    navigate(`/#${normalizedSectionId}`, { replace: options.replace ?? false });
  }, [location.pathname, navigate]);

  const createSectionLinkProps = useCallback((sectionId: string, options: LandingSectionNavigationOptions = {}) => {
    const normalizedSectionId = sectionId.replace(/^#/, '');

    return {
      href: `/#${normalizedSectionId}`,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        scrollToSection(normalizedSectionId, options);
      },
    };
  }, [scrollToSection]);

  return { scrollToSection, createSectionLinkProps };
};