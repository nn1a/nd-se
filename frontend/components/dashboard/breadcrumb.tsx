'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const pathToLabelMap: Record<string, string> = {
  'dashboard': '대시보드',
  'analytics': '분석',
  'users': '사용자',
  'content': '콘텐츠',
  'docs': '문서',
  'blog': '블로그',
  'forum': '포럼',
  'management': '관리',
  'system': '시스템',
  'database': '데이터베이스',
  'security': '보안 설정',
  'notifications': '알림 설정',
  'settings': '설정',
};

const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // 홈 추가
  breadcrumbs.push({
    label: '홈',
    href: '/',
  });

  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    const label = pathToLabelMap[path] || path;
    
    breadcrumbs.push({
      label,
      href: index === paths.length - 1 ? undefined : currentPath, // 마지막 항목은 링크 없음
    });
  });

  return breadcrumbs;
};

interface BreadcrumbProps {
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}>
      <Home className="w-4 h-4" />
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
