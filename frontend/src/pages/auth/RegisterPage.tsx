import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import { GoogleMark } from "../../components/common/GoogleMark";
import { Icon } from "../../components/common/Icon";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useSignupMutation } from "../../services/authApi";
import { useAppSelector } from "../../store/hooks";
import type { RegisterFormData } from "./types/auth.types";
import type { ApiErrorResponse } from "../../types/api.types";

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [signup, { isLoading }] = useSignupMutation();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    agreeTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/trips", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const hasMinLength = formData.password.length >= 6;
  const hasNumber = /\d/.test(formData.password);
  const hasUppercase = /[A-Z]/.test(formData.password);

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

    if (!formData.agreeTerms) {
      setErrorMessage("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư.");
      return;
    }

    if (!hasMinLength) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      const response = await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }).unwrap();

      if (response.success) {
        navigate("/login");
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: ApiErrorResponse; message?: string };
      setErrorMessage(
        apiErr.data?.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo light />
        <div>
          <Badge tone="yellow">TRIPLY</Badge>
          <h1>Chuyến đi mới đang chờ bạn.</h1>
          <p>
            Tạo tài khoản để lưu ý tưởng, mời bạn đồng hành và bắt đầu lên lịch trình thông minh.
          </p>
        </div>
        <small>Ảnh: Mù Cang Chải, Việt Nam</small>
      </div>

      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="back">
            ← Về trang chủ
          </Link>
          <h2>Tạo tài khoản</h2>
          <p>Bắt đầu lên kế hoạch cùng Triply.</p>

          <a
            href="http://localhost:8080/oauth2/authorization/google"
            className="google-auth"
          >
            <GoogleMark />
            Đăng ký với Google
          </a>

          <div className="auth-divider">
            <span>Hoặc tiếp tục với email</span>
          </div>

          {errorMessage && (
            <div className="alert error">
              <strong>Lỗi đăng ký</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>
              Họ và tên
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nguyễn Văn A"
              />
            </label>

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
              <small>Sử dụng email bạn có thể truy cập.</small>
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
                  placeholder="Tạo mật khẩu"
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

            <div className="password-rules">
              <strong>Mật khẩu cần có:</strong>
              <span className={hasMinLength ? "ok" : ""}>
                {hasMinLength ? <Icon name="check" /> : <i />} Ít nhất 6 ký tự
              </span>
              <span className={hasNumber ? "ok" : ""}>
                {hasNumber ? <Icon name="check" /> : <i />} Một chữ số
              </span>
              <span className={hasUppercase ? "ok" : ""}>
                {hasUppercase ? <Icon name="check" /> : <i />} Một chữ in hoa
              </span>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <span>
                Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a> và{" "}
                <a href="#privacy">Chính sách quyền riêng tư</a>.
              </span>
            </label>

            <Button type="submit" className="full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </form>

          <p className="switch-auth">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
