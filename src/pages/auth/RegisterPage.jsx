import React, { useState } from "react";
import styles from "./Registerpage.module.scss";
import { FaEyeSlash } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api/baseUrl";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (form.username.trim().length < 4 || form.username.length > 32) {
      alert("아이디는 4자 이상 32자 이하로 입력해야 합니다.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 60) {
      alert("비밀번호는 8자 이상 60자 이하로 입력해야 합니다.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.name.trim().length < 2 || form.name.length > 32) {
      alert("이름은 2자 이상 32자 이하로 입력해야 합니다.");
      return;
    }

    const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      alert("휴대폰 번호는 형식에 맞게 입력해야 합니다. 예: 010-1234-5678");
      return;
    }

    try {
      const response = await axios.post(
        BASE_URL + "/api/register",
        {
          username: form.username.trim(),
          password: form.password,
          name: form.name.trim(),
          phoneNumber: form.phoneNumber,
        },
        {
          withCredentials: true,
        }
      );

      const { username, name, role } = response.data.data;
      console.log("회원가입 데이터", response.data);

      alert("회원가입에 성공했습니다.");
      navigate("/login");
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert(err.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            name="username"
            placeholder="이메일 또는 아이디"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />
          <FaEyeSlash className={styles.inputIcon} />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <FaEyeSlash className={styles.inputIcon} />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            name="name"
            placeholder="이름 (2-32자)"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="text"
            name="phoneNumber"
            placeholder="휴대폰 번호 (010-1234-5678)"
            value={form.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <button type="submit">회원가입</button>
        </div>

        <div className={styles.footer}>
          <div className={styles.areYouUser}>
            이미 계정이 있으세요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
