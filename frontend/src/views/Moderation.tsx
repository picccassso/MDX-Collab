import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { EventService } from "../services/event.service";
import { useAuthStore } from "../stores/auth.store";
import type { EventProposal } from "../types/event";
import { formatDateTime } from "../utils/date";

export default function Moderation() {
  const { profile, loading: authLoading } = useAuthStore();
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const isAdmin = profile?.admin === true;

  useEffect(() => {
    if (!isAdmin) return;
    EventService.getPendingProposals()
      .then(setProposals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleApprove = async (proposal: EventProposal) => {
    setActing(proposal.id);
    try {
      await EventService.approveProposal(proposal);
      setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      await EventService.rejectProposal(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="page-view">
      <div className="topbar">
        <div className="topbar-title">
          Admin <span>Moderation</span>
        </div>
      </div>

      {error && <div className="form-shell"><div className="auth-error">{error}</div></div>}
      {loading && <div className="form-shell"><div className="empty-state">Loading pending proposals...</div></div>}
      {!loading && proposals.length === 0 && (
        <div className="form-shell">
          <div className="empty-state">No pending event proposals.</div>
        </div>
      )}

      <div className="mod-list">
        {proposals.map((proposal) => (
          <article className="mod-card" key={proposal.id}>
            {proposal.imageUrl ? (
              <img className="mod-card__img" src={proposal.imageUrl} alt={proposal.name} />
            ) : (
              <div className="mod-card__img b2" />
            )}
            <div className="mod-card__body">
              <h3 className="event-title">{proposal.name}</h3>
              <span className="event-date">{formatDateTime(proposal.date)}</span>
              <span className="mod-card__author">by {proposal.authorName}</span>
              {proposal.description && <p className="collab-desc">{proposal.description}</p>}
            </div>
            <div className="mod-card__actions">
              <button
                className="btn-approve"
                type="button"
                disabled={acting === proposal.id}
                onClick={() => handleApprove(proposal)}
              >
                Approve
              </button>
              <button
                className="btn-reject"
                type="button"
                disabled={acting === proposal.id}
                onClick={() => handleReject(proposal.id)}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
