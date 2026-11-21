import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import { GoogleMark } from "../../components/common/GoogleMark";
import { Icon } from "../../components/common/Icon";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useLoginMutation } from "../../services/authApi";
import { useAppSelector } from "../../store/hooks";
import type { LoginFormData } from "./types/auth.types";
import type { ApiErrorResponse } from "../../types/api.types";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/trips", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      }).unwrap(); //unwrap to get the response data or throw error

      if (response.success) {
        navigate("/trips");
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiErrorResponse; message?: string };
      setErrorMessage(
        apiErr.data?.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo light />
        <div>
          <Badge tone="yellow">TRIPLY</Badge>
          <h1>Chào mừng bạn quay lại.</h1>
          <p>
            Mọi kế hoạch, lựa chọn đã lưu và chi phí nhóm vẫn ở đúng nơi bạn để lại.
          </p>
        </div>
        <small>Ảnh: Mù Cang Chải, Việt Nam</small>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="back">
            ← Về trang chủ
          </Link>
          <h2>Đăng nhập</h2>
          <p>Tiếp tục hành trình của bạn với Triply.</p>

          <a
            href="http://localhost:8080/oauth2/authorization/google"
            className="google-auth"
          >
            <GoogleMark />
            Đăng nhập với Google
          </a>

          <div className="auth-divider">
            <span>Hoặc tiếp tục với email</span>
          </div>

          {errorMessage && (
            <div className="alert error">
              <strong>Lỗi đăng nhập</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@triply.com"
              />
              <small>Sử dụng email bạn đã đăng ký.</small>
            </label>

            <label>
              Mật khẩu
              <div className="input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện mật khẩu"
                >
                  <Icon name="eye" />
                </button>
              </div>
            </label>

            <div className="form-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>
                Quên mật khẩu?
              </a>
            </div>

            <Button type="submit" className="full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="switch-auth">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
          <small className="prototype-note">
            Giao diện kết nối API xác thực & OAuth2 Google
          </small>
        </div>
      </div>
    </div>
  );
}
