import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.05),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.03),transparent_24%)]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[40px] border border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,245,245,0.96))] shadow-2xl backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-black/5 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <p className="section-title">Access Gateway</p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight text-stone-950 md:text-6xl">
            Precision monitoring for real water quality operations.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-stone-600">
            Sign into a calmer, more focused operator suite for telemetry review, heartbeat status, residual analysis, and anomaly response.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-black/10 bg-black/[0.02] p-5">
              <p className="section-title text-[10px]">Sensors</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">pH + Temp</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">Live field measurements arriving from the embedded water monitoring unit.</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-black/[0.02] p-5">
              <p className="section-title text-[10px]">Validation</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">Residuals</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">Cross-checking raw and filtered values for fault detection confidence.</p>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-black/[0.02] p-5">
              <p className="section-title text-[10px]">Platform</p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">Supabase</p>
              <p className="mt-3 text-sm leading-6 text-stone-600">Telemetry archive, user access, and dashboard reporting in one backend.</p>
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <p className="section-title">Secure Login</p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-950">Operator Access</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Sign in with the Supabase Authentication user you created for this project.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm text-stone-700">Email</label>
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="operator@lab.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-stone-700">Password</label>
                <input
                  className="input-field"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {error ? <p className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-neutral-800">{error}</p> : null}
              <button className="primary-button w-full" type="submit" disabled={loading}>
                {loading ? "Authorizing..." : "Enter Operator Suite"}
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-black/10 bg-black/[0.02] p-5">
              <p className="section-title text-[10px]">Access Note</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                If login fails, create the user first in Supabase Authentication, then use the exact same email and password here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
