'use client';

import {
  Check,
  ReportGmailerrorred,
  VisibilityOutlined,
  VisibilityOffOutlined,
  WifiOffOutlined
} from "@mui/icons-material";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import Image from 'next/image';
import { loginUser } from "@/app/lib/data";
import { Box, LinearProgress } from "@mui/material";

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'error1'|''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });

  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    const formErrors = { username: '', password: '' };
    let isValid = true;

    if (!username.trim()) {
      formErrors.username = 'Tài khoản không được bỏ trống';
      isValid = false;
    }

    if (!password.trim()) {
      formErrors.password = 'Mật khẩu không được bỏ trống';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setMessage('');
    setMessageType('');

    try {
      const data = await loginUser(username, password) as any;

      if (!data || !data.access_token) {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }
      setIsLoading(true);

      localStorage.setItem("access_token", data.access_token);
      login({
        id: data.id,
        username: data.username,
        role: data.role,
        created_at: data.created_at,
      });
      setTimeout(() => {
        router.push("/tong-quan");
      }, 500);
    } catch (err: any) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setMessage("Lỗi hệ thống.");
        setMessageType("error1");
      } else {
        setMessage("Thông tin đăng nhập không chính xác.");
        setMessageType("error");
      }
    }
  };

  return (
    <>
    {isLoading && (
      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <LinearProgress />
      </Box>
    )}

    <div className="w-full shadow-[0_2px_0_#D9D9D9] rounded-2xl bg-white">
      {message && (
        <div
          className={`rounded-t-2xl h-[36px] flex items-center justify-center text-white ${messageType === 'success' ? 'bg-[#17489E]' : 'bg-[#B8000A]'}`}
        >
          {messageType === 'success' ? <Check className="mr-2" /> : (messageType==='error' ? <ReportGmailerrorred className="mr-2" /> : <WifiOffOutlined className="mr-2" /> )}
          {message}
        </div>
      )}
      <Image src="/lilas-logo.svg" alt="Logo" width={149} height={47} className='m-10 mb-6' />

      <div className="flex p-10 pt-0">
        <div className="w-2/5 flex flex-col">
          <h1 className="text-[32px] text-black">Đăng nhập</h1>
        </div>

        <div className="w-3/5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="text-[17px] font-semibold text-black">Tên tài khoản</label>
              <div className="relative mt-1">
                <input
                  autoFocus
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  maxLength={30}                  
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md bg-[#F5F7FA] border-gray-300"
                  // placeholder="Điền tên tài khoản"
                  aria-invalid={!!errors.username}
                />      
                <div className="min-h-5 mt-1">
                {errors.username && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className='w-4 h-4 mr-1' />
                    {errors.username}
                  </p>
                )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="text-[17px] font-semibold text-black">Mật khẩu</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-[#F5F7FA] border-gray-300"
                  // placeholder="Điền mật khẩu"
                  maxLength={30}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? <VisibilityOffOutlined className="h-5 w-5 text-gray-400" /> : <VisibilityOutlined className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <div className="min-h-5 mt-1">
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ReportGmailerrorred className='w-4 h-4 mr-1' />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="h-10 w-28 bg-[#338BFF] text-white font-medium rounded-md hover:bg-[#66B2FF]"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}