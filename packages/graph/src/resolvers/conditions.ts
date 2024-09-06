import { invokeServiceFunction } from "../utils";

export const getWeatherByZipResolver = (_, input: { zip: string }) => {
  const { zip } = input;
  const resp = invokeServiceFunction("conditions", { zip });
  return resp;
};
