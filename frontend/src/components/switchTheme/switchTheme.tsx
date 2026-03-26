"use client";
import React from "react";
import * as S from "./styles";
import { useTheme } from "next-themes";

function SwitchTheme() {
  const { setTheme } = useTheme();

  return (
    <S.Container>
      <div>
        {/* The current theme is: {theme} */}
        <button onClick={() => setTheme("light")}>Light Mode</button>
        <button onClick={() => setTheme("dark")}>Dark Mode</button>
      </div>
    </S.Container>
  );
}

export default SwitchTheme;
