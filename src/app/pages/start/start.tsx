'use client';
import './start.css'
import Search from "../../../assets/search.svg"
import Car from "../../../assets/car.svg"
import Person from "../../../assets/person.svg"
import { useState } from "react";
import { useRouter } from "next/navigation";



    type StartProps = {
        onStart: (keyword: string) => void;  // ✅ 검색어를 부모로 전달
    };

    export default function Start({ onStart }: StartProps) {
        const [keyword, setKeyword] = useState("");
        const [isFocused, setIsFocused] = useState(false);

        const handleSearch = () => {
            const q = keyword.trim();
            if (!q) return;
            onStart(q);   // ✅ 여기서 부모 함수 호출
        };
        const showGuide = !isFocused && keyword === "";

    return(
        <div className="main">
            <div className="main-top">
                <video src="/icon.mp4" autoPlay muted loop playsInline className="my-video" style={{ width: "20vw", height: "15vw" }}/>
                <div className='main-top-two'>
                    <div className="main-top-text">
                        <div className="main-top-text-small">안녕하세요</div>
                        <div className="main-top-text-big">어떤 주차장을 찾으시나요?</div>
                    </div>
                    <div className='border'>
                        <div className='main-top-search'>
                            <input
                                className="searchInput"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <div className={`main-top-search-text ${showGuide ? "" : "hidden"}`}>주차장 이름이나 주소를 입력해주세요</div>
                            <div onClick={handleSearch} style={{
                                position: "relative",
                                zIndex: 10,        // 인풋보다 위로
                                cursor: "pointer", // 마우스 손가락 모양
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                }}
                            >
                            <img src={Search.src} alt="대표아이콘" style={{ width: "2.3vw", height: "2.3vw", inset:"0" }} /></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='main-bottom'>
                <div className='main-bottom-box'>
                    <div className='main-bottom-new-gap'>
                        <img src={Car.src} alt="대표아이콘" style={{ width: "5.2vw", height: "4.8vw" }}/>
                    </div>
                    <div className='main-bottom-new-text'>
                        <div className='main-bottom-text-small'>처음 왔다면</div>
                        <div className='main-bottom-text-big'>정보 입력하고 추천받기</div>
                    </div>
                </div>
                <div className='main-bottom-box'>
                    <div className='main-bottom-ori-gap'>
                        <img src={Person.src} alt="대표아이콘" style={{ width: "5vw", height: "5vw" }}/>
                    </div>
                    <div className='main-bottom-new-text'>
                        <div className='main-bottom-text-small'>이용한 적이 있다면</div>
                        <div className='main-bottom-text-big'>지금 바로 추천받기</div>
                    </div>
                </div>
            </div>
        </div>
    );
    }