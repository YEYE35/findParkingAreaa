'use client';
import './start.css';
import Search from "../../../assets/search.svg";
import { useState } from "react";

type StartProps = {
  onStart: (keyword: string) => void;
};

export default function Start({ onStart }: StartProps) {
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const handleSearch = () => {
    const q = keyword.trim();
    if (!q) return;
    onStart(q);
  };
  const showGuide = !isFocused && keyword === "";

  return (
    <div className="main">
      <div className="main-top">
        <video
          src="/icon.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="my-video"
          style={{ width: "20vw", height: "15vw" }}
        />
        <div className="main-top-two">
          <div className="main-top-text">
            <div className="main-top-text-small">안녕하세요</div>
            <div className="main-top-text-big">어떤 주차장을 찾으시나요?</div>
          </div>
          <div className="border">
            <div className="main-top-search">
              <input
                className="searchInput"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <div
                className={`main-top-search-text ${
                  showGuide ? "" : "hidden"
                }`}
              >
                주차장 이름이나 주소를 입력해주세요 (ex. 노원구)
              </div>
              <div
                onClick={handleSearch}
                style={{
                  position: "relative",
                  zIndex: 10,       
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={Search.src}
                  alt="대표아이콘"
                  style={{ width: "2.3vw", height: "2.3vw", inset: "0" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
