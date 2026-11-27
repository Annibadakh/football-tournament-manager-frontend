import { Award, Crown, Medal, Star, Trophy } from "lucide-react";
import { AWARD_TYPE } from "@/constants/award.constants";
import { cn } from "@/utils/cn";

const ICON = {
  [AWARD_TYPE.CHAMPION]: Trophy,
  [AWARD_TYPE.RUNNER_UP]: Medal,
  [AWARD_TYPE.THIRD_PLACE]: Medal,
  [AWARD_TYPE.GROUP_WINNER]: Crown,
  [AWARD_TYPE.GOLDEN_BOOT]: Star,
  [AWARD_TYPE.MOST_ASSISTS]: Star,
  [AWARD_TYPE.MOST_POTM]: Star,
};

const TONE = {
  [AWARD_TYPE.CHAMPION]: "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-100",
  [AWARD_TYPE.GOLDEN_BOOT]: "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-100",
};

// Icon + title (+ value) for an award; used in lists on profile, team and tournament pages
const AwardIcon = ({ type, className = "" }) => {
  const Icon = ICON[type] ?? Award;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        TONE[type] ?? "bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
};

export default AwardIcon;
