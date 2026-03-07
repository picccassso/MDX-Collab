import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CollabListItem from "../components/CollabListItem";
import { CollaborationService } from "../services/collaboration.service";
import { useAuthStore } from "../stores/auth.store";
import type { Collaboration } from "../types/collaboration";
import { getCollaborationSearchScore } from "../utils/collaboration";
import { formatRelativeDate } from "../utils/date";
import { buildDirectMessageHref } from "../utils/messaging";

const filters = ["All", "Game Dev", "Music", "Film & Media", "Design", "Tech"];

function matchesFilter(collab: Collaboration, activeFilter: string): boolean {
  if (activeFilter === "All") return true;
  const text = `${collab.title} ${collab.description} ${collab.tags.join(" ")}`.toLowerCase();
  const normalized = activeFilter.toLowerCase().replace("&", "and");
  return text.includes(normalized) || collab.tags.some((tag) => tag.toLowerCase().includes(normalized));
}

export default function Collaborations() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    CollaborationService.getAll()
      .then(setCollabs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredCollabs = useMemo(
    () => collabs.filter((collab) => matchesFilter(collab, activeFilter)),
    [collabs, activeFilter],
  );

  const visible = useMemo(() => {
    const query = deferredSearchQuery.trim();
    if (!query) return filteredCollabs;

    return filteredCollabs
      .map((collab) => ({
        collab,
        score: getCollaborationSearchScore(collab, query),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.collab);
  }, [deferredSearchQuery, filteredCollabs]);

  const quickResults = useMemo(() => visible.slice(0, 4), [visible]);
  const hasActiveSearch = deferredSearchQuery.trim().length > 0;
  const showSearchPanel = searchOpen && hasActiveSearch;

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    collabs.forEach((collab) => {
      collab.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [collabs]);

  return (
    <div className="page-view">
      <div className="topbar">
        <div className="topbar-title">
          <span>Collabs</span>
        </div>
        <div className="topbar-actions">
          <div
            ref={searchRef}
            className={`collab-search ${showSearchPanel ? "is-open" : ""}`}
            onBlur={(event) => {
              if (!searchRef.current?.contains(event.relatedTarget as Node | null)) {
                setSearchOpen(false);
              }
            }}
          >
            <div className="search-bar">
              <svg className="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search collabs, skills"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                aria-label="Search collaborations"
              />
            </div>
            <div className={`collab-search-panel ${showSearchPanel ? "is-visible" : ""}`}>
              <div className="collab-search-panel__header">
                <span>{visible.length} match{visible.length === 1 ? "" : "es"}</span>
                <span>Local search only</span>
              </div>
              {quickResults.length > 0 ? (
                <div className="collab-search-panel__list">
                  {quickResults.map((collab) => (
                    <button
                      key={`search-${collab.id}`}
                      type="button"
                      className="collab-search-result"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigate(`/collaborations/${collab.id}`)}
                    >
                      <span className="collab-search-result__title">{collab.title}</span>
                      <span className="collab-search-result__meta">
                        {collab.tags.slice(0, 2).join(" • ") || "Open collaboration"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="collab-search-panel__empty">No collabs match that search yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="collabs-layout">
        <section className="collabs-feed">
          <div className="filters collab-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="create-post-box">
            <Link className="btn-sm accent" to="/collaborations/new">
              + New Collab
            </Link>
          </div>

          {loading && <div className="empty-state">Loading collaborations...</div>}
          {error && <div className="auth-error">{error}</div>}
          {!loading && !error && visible.length === 0 && (
            <div className="empty-state">
              {hasActiveSearch ?
                "No collaborations match your search." :
                "No collaborations match the selected filter."}
            </div>
          )}

          {visible.map((collab) => (
            <CollabListItem
              key={collab.id}
              collab={collab}
              clickable
              ariaLabel={`Open collaboration ${collab.title}`}
              onOpen={() => navigate(`/collaborations/${collab.id}`)}
              meta={formatRelativeDate(collab.createdAt)}
              topRight={
                <div className="tags">
                  <span className="tag green">Open</span>
                </div>
              }
              roles={
                collab.tags.length > 0 ? (
                  <div className="roles">
                    {collab.tags.slice(0, 3).map((tag) => (
                      <div className="role-chip" key={`${collab.id}-${tag}`}>
                        <span className="dot-o" />
                        {tag}
                      </div>
                    ))}
                    {collab.files.length > 0 && (
                      <div className="role-chip">
                        <span className="dot-f" />
                        {collab.files.length} assets
                      </div>
                    )}
                  </div>
                ) : undefined
              }
              actions={
                <div className="collab-actions">
                  <Link className="btn-sm accent" to={`/collaborations/${collab.id}`}>
                    Open
                  </Link>
                  {user?.uid !== collab.authorId && (
                    <Link
                      className="btn-sm outline"
                      to={buildDirectMessageHref(user?.uid, collab.authorId, { username: collab.authorName })}
                    >
                      Message Host
                    </Link>
                  )}
                </div>
              }
            />
          ))}
        </section>

        <aside className="collabs-aside">
          <div className="aside-card">
            <div className="aside-card-title">Trending Skills Needed</div>
            {topTags.length === 0 && <div className="skill-count">No trend data yet.</div>}
            {topTags.map(([tag, count]) => (
              <div className="skill-item" key={tag}>
                <span className="skill-dot" />
                <div style={{ flex: 1 }}>
                  <div className="skill-name">{tag}</div>
                  <div className="skill-count">{count} open posts</div>
                </div>
                <span className="trend-up">+{count}</span>
              </div>
            ))}
          </div>

          <div className="aside-card">
            <div className="aside-card-title">Matched for You</div>
            <p className="collabs-match-copy">
              Mockup section without recommendation logic. Showing latest posts.
            </p>
            <div className="collabs-match-list">
              {collabs.slice(0, 2).map((collab) => (
                <div key={`match-${collab.id}`} className="collabs-match-item">
                  <div className="collabs-match-title">{collab.title}</div>
                  <div className="collab-meta">{formatRelativeDate(collab.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
