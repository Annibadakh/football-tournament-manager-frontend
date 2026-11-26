import { useEffect, useState } from "react";
import { listTournamentCategories } from "@/services/tournament.service";

// Master lists rarely change: fetch once per page load and share across components
let cachedCategories = null;
let pendingRequest = null;

const toOptions = (items = []) => items.map((item) => ({ label: item.name, value: item.id }));

const useTournamentCategories = () => {
  const [categories, setCategories] = useState(cachedCategories);

  useEffect(() => {
    if (cachedCategories) return;
    pendingRequest ??= listTournamentCategories().then((res) => {
      if (res.ok) cachedCategories = res.data;
      pendingRequest = null;
      return cachedCategories;
    });
    pendingRequest.then((data) => data && setCategories(data));
  }, []);

  return {
    categories,
    gameFormatOptions: toOptions(categories?.gameFormats),
    ageGroupOptions: toOptions(categories?.ageGroups),
    genderOptions: toOptions(categories?.genderCategories),
  };
};

export default useTournamentCategories;
