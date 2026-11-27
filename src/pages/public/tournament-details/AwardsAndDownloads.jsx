import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import AwardsList from "@/components/profile/AwardsList";
import Card from "@/components/ui/Card";
import { EXPORT_KIND } from "@/constants/award.constants";
import { TOURNAMENT_STATUS } from "@/constants/tournament.constants";
import { exportUrl, listAwards } from "@/services/profile.service";

const DOWNLOADS = [
  { kind: EXPORT_KIND.STANDINGS, label: "Points table" },
  { kind: EXPORT_KIND.FIXTURES, label: "Fixtures & results" },
  { kind: EXPORT_KIND.SUMMARY, label: "Tournament summary", completedOnly: true },
];

// Awards (after completion or custom ones) and public PDF downloads
const AwardsAndDownloads = ({ tournament, hasMatches }) => {
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    let isCurrent = true;
    listAwards(tournament.slug, { errorToast: false }).then((res) => {
      if (isCurrent && res.ok) setAwards(res.data);
    });
    return () => {
      isCurrent = false;
    };
  }, [tournament.slug]);

  const isCompleted = tournament.status === TOURNAMENT_STATUS.COMPLETED;
  const downloads = DOWNLOADS.filter((item) => !item.completedOnly || isCompleted);

  return (
    <>
      {awards.length > 0 && (
        <Card title="Awards" subtitle={isCompleted ? "Final awards" : "Awarded so far"}>
          <AwardsList awards={awards} />
        </Card>
      )}
      {hasMatches && (
        <Card title="Downloads" subtitle="PDF, times in IST">
          <ul className="flex flex-col gap-2">
            {downloads.map((item) => (
              <li key={item.kind} className="flex items-center justify-between gap-2 text-sm">
                <a
                  href={exportUrl(tournament.slug, item.kind)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-link hover:underline"
                >
                  <FileText className="size-4" aria-hidden="true" /> {item.label}
                </a>
                <a
                  href={exportUrl(tournament.slug, item.kind, { download: true })}
                  aria-label={`Download ${item.label} PDF`}
                  className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-muted hover:text-fg"
                >
                  <Download className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
};

export default AwardsAndDownloads;
