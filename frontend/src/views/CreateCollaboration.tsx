import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import TagInput from "../components/TagInput";
import { CollaborationService } from "../services/collaboration.service";
import { useAuthStore } from "../stores/auth.store";

const roleSuggestions = ["Graphic Designer", "Music Producer", "Developer", "Editor"];

export default function CreateCollaboration() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Game Dev");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = !!user;

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const allowed = Array.from(incoming).filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.type === "application/zip" ||
        f.type === "application/x-zip-compressed",
    );
    setFiles((prev) => [...prev, ...allowed]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRole = (role: string) => {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await CollaborationService.create(
        {
          title: title.trim(),
          description: description.trim(),
          authorId: user.uid,
          authorName: profile.username ?? user.email ?? "Anonymous",
          tags: tags.length > 0 ? tags : [category.toLowerCase()],
        },
        files,
      );
      navigate("/collaborations");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-view">
      <div className="topbar">
        <div className="topbar-title">
          <span>Post a Collab</span>
        </div>
        <div className="topbar-actions">
          <Link className="btn-sm outline" to="/collaborations">
            Back to Collabs
          </Link>
        </div>
      </div>

      <div className="form-shell">
        <div className="form-card">
          {!isLoggedIn && (
            <div className="auth-notice">You can fill out the form, but you must sign in to post it.</div>
          )}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="collab-title">Project Title</label>
              <input
                id="collab-title"
                type="text"
                placeholder="e.g. Horror Game - Signal Lost"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="collab-category">Category</label>
              <select
                id="collab-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Game Dev</option>
                <option>Music</option>
                <option>Film and Media</option>
                <option>Design</option>
                <option>Tech</option>
                <option>Art</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="collab-desc">Description</label>
              <textarea
                id="collab-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project and the collaborators you are looking for."
              />
            </div>

            <div className="form-group">
              <label>Roles Needed (UI only)</label>
              <div className="roles-builder">
                {roleSuggestions.map((role) => (
                  <button
                    key={role}
                    className="role-add-chip"
                    type="button"
                    onClick={() => toggleRole(role)}
                    style={roles.includes(role) ? { borderColor: "var(--red)", color: "var(--red)" } : undefined}
                  >
                    {roles.includes(role) ? "Selected: " : "+ "}
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <TagInput tags={tags} onChange={setTags} placeholder="#unity #horror #indie" />
            </div>

            <div className="form-group">
              <label>Files (images or .zip)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.zip"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
              <button className="btn-secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </button>
              {files.length > 0 && (
                <ul className="file-list">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="btn-primary" type="submit" disabled={saving || !isLoggedIn}>
              {saving ? "Posting..." : !isLoggedIn ? "Sign in to post" : "Post Collab"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
