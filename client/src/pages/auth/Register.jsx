import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { School, UserPlus, AlertCircle } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [gender, setGender] = useState("female");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes/public").catch(() => []);
      if (Array.isArray(res)) {
        setClasses(res);
        if (res.length && !classId) {
          setClassId(res[0]._id);
        }
      }
    } catch (e) {
      setClasses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        gender,
        classId: classId || undefined,
        admissionNumber: admissionNumber.trim() || undefined,
      };

      const res = await api.post("/auth/register", payload);
      login(res.token, res.user);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <School size={28} style={{ color: "var(--primary)" }} />
          <span
            style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--ink)" }}
          >
            SMS Portal
          </span>
        </div>

        <h2>Create account</h2>
        <p className="subtitle">Student self-registration</p>

        {error && (
          <div
            className="error"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label style={{ marginTop: "12px" }}>
            Email address
            <input
              type="email"
              required
              placeholder="e.g. student@school.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <div className="form-row" style={{ marginTop: "12px" }}>
            <label>
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>

            {classes.length > 0 ? (
              <label>
                Class
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Admission number
                <input
                  type="text"
                  placeholder="Optional — auto-generated if blank"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                />
              </label>
            )}
          </div>

          {classes.length > 0 && (
            <label style={{ marginTop: "12px" }}>
              Admission number
              <input
                type="text"
                placeholder="Optional — auto-generated if blank"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
              />
            </label>
          )}

          <label style={{ marginTop: "12px" }}>
            Password
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "20px" }}
            disabled={loading}
          >
            <UserPlus size={18} /> {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <div
          style={{ marginTop: "20px", textAlign: "center", fontSize: ".88rem" }}
        >
          <span className="muted">Already registered? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
