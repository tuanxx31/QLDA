import { RcFile } from "antd/es/upload";

export const formatPrice = (value: number) => {
  if (!value) return "";
  return value.toLocaleString("vi-VN") + " VND";
};

export const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const generateFileWithTimeStamp = (file: RcFile) => {
  const extension = file.name.includes(".")
    ? file.name.substring(file.name.lastIndexOf("."))
    : "";
  // Tạo tên mới với hậu tố thời gian
  const timestamp = Date.now();
  const newFileName =
    file.name.replace(extension, "") + "_" + timestamp + extension;
  const newFile = new File([file], newFileName, {
    type: file.type,
  });
  return {newFile, newFileName};
};

export const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
