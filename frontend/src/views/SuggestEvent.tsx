import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EventService } from "../services/event.service";
import { useAuthStore } from "../stores/auth.store";

export default function SuggestEvent() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("Workshop");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = !!user;

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be signed in to submit an event.");
      return;
    }

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }
    if (!date) {
      setError("Date is required");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await EventService.submitProposal(
        {
          name: name.trim(),
          description: description.trim(),
          date: new Date(date),
          authorId: user.uid,
          authorName: profile?.username ?? user.displayName ?? user.email ?? "Anonymous",
        },
        image,
      );
      navigate("/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-view">
      <div className="topbar">
        <div className="topbar-title">
          <span>Suggest Event</span>
        </div>
        <div className="topbar-actions">
          <Link className="btn-sm outline" to="/events">
            Back to Events
          </Link>
        </div>
      </div>

      <div className="form-shell">
        <div className="form-card">
          {!isLoggedIn && (
            <div className="auth-notice">You can fill out the form, but you must sign in to submit.</div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="event-name">Event Name</label>
              <input
                id="event-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-type">Type (UI field)</label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option>Workshop</option>
                <option>Hackathon</option>
                <option>Showcase</option>
                <option>Social</option>
                <option>Talk</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-desc">Description</label>
              <textarea
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Picture</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e.target.files?.[0])}
                style={{ display: "none" }}
              />
              <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()}>
                {image ? "Change Picture" : "Choose Picture"}
              </button>
              {preview && <img className="event-preview" src={preview} alt="Preview" />}
            </div>

            <button className="btn-primary" type="submit" disabled={saving || !isLoggedIn}>
              {saving ? "Submitting..." : !isLoggedIn ? "Sign in to submit" : "Submit Suggestion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
