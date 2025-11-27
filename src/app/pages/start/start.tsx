'use client';
import './start.css'
// 3d.png wasn't present in the repository; use a public placeholder instead
import Image from "../../../assets/3d.png"
import Search from "../../../assets/search.svg"
import Car from "../../../assets/car.svg"

export default function Start({ onStart }: { onStart: () => void }){
    return(
        <div className="main">
            <div className="main-top">
                <img src={Image.src} alt="대표아이콘" style={{ width: "20vw", height: "15vw" }}/>
                <div className='main-top-two'>
                    <div className="main-top-text">
                        <div className="main-top-text-small" onClick={onStart}>안녕하세요</div>
                        <div className="main-top-text-big">어떤 주차장을 찾으시나요?</div>
                    </div>
                    <div className='border'>
                        <div className='main-top-search'>
                            <img src={Search.src} alt="대표아이콘" style={{ width: "2.3vw", height: "2.3vw" }}/>
                            <div className='main-top-search-text'>주차장 이름이나 주소를 입력해주세요</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='main-bottom'>
                <div className='main-bottom-new'>
                    <div className='car'>
                    <img src={Car.src} alt="대표아이콘" style={{ width: "5.2vw", height: "4.8vw" }}/>
                    </div>
                    <div className='main-bottom-new-text'>
                        <div className='main-bottom-text-small'>처음 오셨나요?</div>
                        <div className='main-bottom-text-big'>필요하신 주차장을 추천해드릴게요!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}