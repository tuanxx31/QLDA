import type { Route } from "./+types/home";
import { useEffect } from "react";
import ButtonLogOut from "../components/ButtonLogOut";
import { useNavigate } from "react-router";

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


  return <>
  <div>Home</div>
  <ButtonLogOut />
  </> ;
}
