"use client";
import React from "react";
import ScrollFloat from "@/components/ScrollFloat";

const Identity = () => {
  return (
    <div className="mx-auto w-[min(80vw,1200px)] pt-6 h-screen">
      <ScrollFloat
        animationDuration={1}
        ease="back.inOut(2)"
        scrollStart="center bottom+=50%"
        scrollEnd="bottom bottom-=40%"
        stagger={0.03}
        textClassName="font-bold "
      >
        Finger Print?
      </ScrollFloat>
    </div>
  );
};

export default Identity;
