import type { NavIconKey } from '#lib/data/homepage.ts';
import BellRingingIcon from 'phosphor-svelte/lib/BellRingingIcon';
import BooksIcon from 'phosphor-svelte/lib/BooksIcon';
import BroadcastIcon from 'phosphor-svelte/lib/BroadcastIcon';
import CalculatorIcon from 'phosphor-svelte/lib/CalculatorIcon';
import ChartLineIcon from 'phosphor-svelte/lib/ChartLineIcon';
import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
import CompassIcon from 'phosphor-svelte/lib/CompassIcon';
import GraduationCapIcon from 'phosphor-svelte/lib/GraduationCapIcon';
import IdentificationBadgeIcon from 'phosphor-svelte/lib/IdentificationBadgeIcon';
import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
import ListMagnifyingGlassIcon from 'phosphor-svelte/lib/ListMagnifyingGlassIcon';
import NewspaperIcon from 'phosphor-svelte/lib/NewspaperIcon';
import PulseIcon from 'phosphor-svelte/lib/PulseIcon';
import RocketLaunchIcon from 'phosphor-svelte/lib/RocketLaunchIcon';
import ScanIcon from 'phosphor-svelte/lib/ScanIcon';
import StorefrontIcon from 'phosphor-svelte/lib/StorefrontIcon';
import StudentIcon from 'phosphor-svelte/lib/StudentIcon';
import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
import WalletIcon from 'phosphor-svelte/lib/WalletIcon';

/** Phosphor icon per navigation entry. Keys are declared in `#lib/data/homepage.ts`. */
export const NAV_ICONS: Record<NavIconKey, typeof BellRingingIcon> = {
	broadcast: BroadcastIcon,
	bell: BellRingingIcon,
	mentorship: StudentIcon,
	storefront: StorefrontIcon,
	mission: CompassIcon,
	about: IdentificationBadgeIcon,
	blog: NewspaperIcon,
	resources: BooksIcon,
	'day-trading': LightningIcon,
	'swing-trading': ChartLineUpIcon,
	'small-accounts': WalletIcon,
	spx: PulseIcon,
	'explosive-swings': RocketLaunchIcon,
	courses: GraduationCapIcon,
	indicators: ChartLineIcon,
	scanners: ScanIcon,
	calculator: CalculatorIcon,
	'etf-list': ListMagnifyingGlassIcon,
	'index-list': TrendUpIcon
};
