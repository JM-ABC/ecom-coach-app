import React from 'react';
import {
  SparklesIcon, MagnifyingGlassIcon, PencilIcon, RectangleGroupIcon,
  CalendarDaysIcon, QuestionMarkCircleIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronDownIcon, ChevronUpIcon, Cog6ToothIcon, TrophyIcon, BoltIcon,
  CursorArrowRaysIcon, ArrowTrendingUpIcon, CheckIcon, CheckCircleIcon,
  PlusIcon, XMarkIcon, FunnelIcon, TagIcon, ExclamationTriangleIcon,
  ClockIcon, Bars3Icon, Squares2X2Icon, ArrowRightIcon, ArchiveBoxIcon,
  FlagIcon, LightBulbIcon, ShareIcon, DocumentDuplicateIcon,
  ArrowDownTrayIcon, ArrowPathIcon, UsersIcon, CubeIcon, CloudIcon,
  PhotoIcon, EyeIcon, StarIcon,
} from '@heroicons/react/24/outline';

const ICONS: Record<string, React.ElementType> = {
  sparkles: SparklesIcon,
  search: MagnifyingGlassIcon,
  pen: PencilIcon,
  layout: RectangleGroupIcon,
  calendar: CalendarDaysIcon,
  help: QuestionMarkCircleIcon,
  chevLeft: ChevronLeftIcon,
  chevRight: ChevronRightIcon,
  chevDown: ChevronDownIcon,
  chevUp: ChevronUpIcon,
  settings: Cog6ToothIcon,
  crown: TrophyIcon,
  zap: BoltIcon,
  target: CursorArrowRaysIcon,
  trendUp: ArrowTrendingUpIcon,
  check: CheckIcon,
  checkCircle: CheckCircleIcon,
  plus: PlusIcon,
  x: XMarkIcon,
  filter: FunnelIcon,
  tag: TagIcon,
  alert: ExclamationTriangleIcon,
  clock: ClockIcon,
  list: Bars3Icon,
  grid: Squares2X2Icon,
  arrowRight: ArrowRightIcon,
  package: ArchiveBoxIcon,
  flag: FlagIcon,
  lightbulb: LightBulbIcon,
  trending: ArrowTrendingUpIcon,
  share: ShareIcon,
  copy: DocumentDuplicateIcon,
  download: ArrowDownTrayIcon,
  refresh: ArrowPathIcon,
  users: UsersIcon,
  box: CubeIcon,
  cloud: CloudIcon,
  image: PhotoIcon,
  eye: EyeIcon,
  star: StarIcon,
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  fill?: string;
}

export default function Icon({ name, size = 16, stroke = 1.5, fill }: IconProps) {
  const Component = ICONS[name];
  if (!Component) return null;
  return (
    <Component
      width={size}
      height={size}
      strokeWidth={stroke}
      style={{ flexShrink: 0, display: 'block', fill: fill ?? 'none' }}
    />
  );
}
