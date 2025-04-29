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
    max_failed_code_attempts: 10,
    max_failed_password_attempts: 0,
    password_loading_time: 5000,
    sheet_id: "1UQzMyjnsNkErG9PrFo-H4AjxJs9x4bXz0-jX5xYb58A"
  },
};
const getConfig = (): Config => {
  return defaultConfig;
};

export default getConfig;
