import type * as React from "react";

export type Socials = {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type FooterProps = {
  className?: string;
  bigWord?: string;
  motto?: string;
  rightsText?: string;
  navItems?: NavItem[];
  email?: string;
  phone?: string;
  socials?: Socials;
};

export type SocialKey = keyof Socials;

export type SocialItem = {
  key: SocialKey;
  label: string;
  href?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};
