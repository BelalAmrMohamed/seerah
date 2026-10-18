"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { reduced } from "@/lib/scroll";
const Stage = dynamic(() => import("./three/Stage"), { ssr: false });
export default function StageLoader() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(!reduced()); }, []);
  return on ? <Stage /> : null;
}
