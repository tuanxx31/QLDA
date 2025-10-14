import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { useEffect } from "react";
import { Button, Flex } from 'antd';
import React from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {

  const navigate = useNavigate(); 

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    console.log("accessToken", accessToken);
    if (!accessToken) {
      navigate("/login");
    }
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return <>
  <div>Home</div>
  <Button type="primary" danger onClick={handleLogout} >
      Đăng xuất
    </Button>
  </> ;
}
