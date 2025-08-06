'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Settings,
  FileText,
  Database,
  Shield,
  Bell,
  Activity,
  Folder,
  File
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: '개요',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'analytics',
    label: '분석',
    icon: BarChart3,
    children: [
      {
        id: 'analytics-general',
        label: '일반 통계',
        href: '/dashboard/analytics',
        icon: Activity,
      },
      {
        id: 'analytics-users',
        label: '사용자 분석',
        href: '/dashboard/analytics/users',
        icon: Users,
      },
      {
        id: 'analytics-content',
        label: '콘텐츠 분석',
        icon: FileText,
        children: [
          {
            id: 'analytics-content-docs',
            label: '문서 통계',
            href: '/dashboard/analytics/content/docs',
            icon: File,
          },
          {
            id: 'analytics-content-blog',
            label: '블로그 통계',
            href: '/dashboard/analytics/content/blog',
            icon: File,
          },
          {
            id: 'analytics-content-forum',
            label: '포럼 통계',
            href: '/dashboard/analytics/content/forum',
            icon: File,
          },
        ]
      }
    ]
  },
  {
    id: 'management',
    label: '관리',
    icon: Folder,
    children: [
      {
        id: 'management-users',
        label: '사용자 관리',
        href: '/dashboard/management/users',
        icon: Users,
      },
      {
        id: 'management-content',
        label: '콘텐츠 관리',
        icon: FileText,
        children: [
          {
            id: 'management-content-docs',
            label: '문서 관리',
            href: '/dashboard/management/content/docs',
            icon: File,
          },
          {
            id: 'management-content-blog',
            label: '블로그 관리',
            href: '/dashboard/management/content/blog',
            icon: File,
          },
        ]
      },
      {
        id: 'management-system',
        label: '시스템 관리',
        icon: Database,
        children: [
          {
            id: 'management-system-database',
            label: '데이터베이스',
            href: '/dashboard/management/system/database',
            icon: Database,
          },
          {
            id: 'management-system-security',
            label: '보안 설정',
            href: '/dashboard/management/system/security',
            icon: Shield,
          },
          {
            id: 'management-system-notifications',
            label: '알림 설정',
            href: '/dashboard/management/system/notifications',
            icon: Bell,
          },
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: '설정',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface SidebarItemProps {
  item: MenuItem;
  level: number;
  pathname: string;
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  item, 
  level, 
  pathname, 
  expandedItems, 
  onToggle 
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActive = item.href === pathname;
  const isParentActive = item.href && pathname.startsWith(item.href) && pathname !== item.href;
  
  const handleToggle = () => {
    if (hasChildren) {
      onToggle(item.id);
    }
  };

  const indentClasses = cn(
    'flex items-center w-full text-left py-2 text-sm rounded-md transition-colors',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    {
      'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300': isActive,
      'text-blue-600 dark:text-blue-400': isParentActive,
      'text-gray-700 dark:text-gray-300': !isActive && !isParentActive,
      'pl-3': level === 0,
      'pl-6': level === 1,
      'pl-9': level === 2,
      'pl-12': level === 3,
    }
  );

  const ItemContent = (
    <div 
      className={indentClasses}
      onClick={hasChildren && !item.href ? handleToggle : undefined}
    >
      {item.icon && <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {hasChildren && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggle();
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {item.href ? (
        <Link href={item.href}>
          {ItemContent}
        </Link>
      ) : (
        ItemContent
      )}
      
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              pathname={pathname}
              expandedItems={expandedItems}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  
  // 초기값을 설정할 때 현재 경로를 고려하여 설정
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // 초기 렌더링 시 현재 경로를 바탕으로 확장할 메뉴들을 결정
    const findInitialExpandedItems = (items: MenuItem[], currentPath: string[] = []): string[] => {
      for (const item of items) {
        const fullPath = [...currentPath, item.id];
        
        if (item.href === pathname) {
          return fullPath.slice(0, -1); // 활성 메뉴의 부모들만 반환
        }
        
        if (item.children && item.children.length > 0) {
          const childResult = findInitialExpandedItems(item.children, fullPath);
          if (childResult.length > 0) {
            return childResult;
          }
        }
        
        if (item.href && pathname.startsWith(item.href + '/')) {
          if (item.children && item.children.length > 0) {
            const childResult = findInitialExpandedItems(item.children, fullPath);
            if (childResult.length > 0) {
              return childResult;
            }
          }
          return fullPath.slice(0, -1);
        }
      }
      return [];
    };

    const initialExpanded = findInitialExpandedItems(menuItems);
    return new Set(initialExpanded);
  });

  // URL이 변경될 때마다 확장 상태 업데이트
  useEffect(() => {
    const findActiveMenuPath = (items: MenuItem[], currentPath: string[] = []): string[] => {
      for (const item of items) {
        const fullPath = [...currentPath, item.id];
        
        if (item.href === pathname) {
          return fullPath;
        }
        
        if (item.children && item.children.length > 0) {
          const childResult = findActiveMenuPath(item.children, fullPath);
          if (childResult.length > 0) {
            return childResult;
          }
        }
        
        if (item.href && pathname.startsWith(item.href + '/')) {
          if (item.children && item.children.length > 0) {
            const childResult = findActiveMenuPath(item.children, fullPath);
            if (childResult.length > 0) {
              return childResult;
            }
          }
          return fullPath;
        }
      }
      return [];
    };

    const activePath = findActiveMenuPath(menuItems);
    
    if (activePath.length > 0) {
      // 활성 메뉴의 모든 부모들을 확장
      const pathsToExpand = activePath.slice(0, -1);
      setExpandedItems(new Set(pathsToExpand));
    } else {
      setExpandedItems(new Set());
    }
  }, [pathname]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={cn('w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          대시보드
        </h2>
      </div>
      
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            level={0}
            pathname={pathname}
            expandedItems={expandedItems}
            onToggle={toggleExpanded}
          />
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
