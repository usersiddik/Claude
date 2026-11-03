import { DEFAULT_FILTER, isFilterId, type FilterId } from "@/lib/assets/filters";

export interface LibraryState {
  query: string;
  filter: FilterId;
  asset: string | null;
}

export const DEFAULT_STATE: LibraryState = { query: "", filter: DEFAULT_FILTER, asset: null };

interface ParamsLike {
  get(name: string): string | null;
}

export function readState(params: ParamsLike | null): LibraryState {
  if (!params) return DEFAULT_STATE;
  const filter = params.get("filter");
  return {
    query: params.get("q") ?? "",
    filter: isFilterId(filter) ? filter : DEFAULT_FILTER,
    asset: params.get("asset"),
  };
}

/** Serialises state into a search string, leaving unrelated params alone. */
export function writeSearch(current: string, state: LibraryState): string {
  const params = new URLSearchParams(current);
  const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key));
  set("q", state.query.trim() ? state.query : null);
  set("filter", state.filter === DEFAULT_FILTER ? null : state.filter);
  set("asset", state.asset);
  const search = params.toString();
  return search ? `?${search}` : "";
}
