/**
 * ------------------------------------------------------------------
 * Project: 2026 Season's Greeting Web App (Prototype)
 * Description: p5.js 기반의 인터랙티브 시즌 그리팅 생성 서비스
 * * [향후 개발 필요 사항 (TODO)]
 * 1. LLM API 연동: fetchSentencesFromLLM 함수 내부 구현 필요 -> generateContent 함수 차용
 * 2. 이미지 에셋 준비: data 폴더에 실제 디자인 파일 배치 및 stickerDatabase 경로 수정
 * 3. 서버 연동: 결과 이미지 업로드 및 QR 코드 생성 로직 (uploadAndGenerateQR) 구현
 * ------------------------------------------------------------------
 */

// ==================================================================
// 1. 전역 변수 및 설정 (Global Configuration)
// ==================================================================

// 화면 상태 관리 (0:스플래시, 1~2:질문, 3:로딩, 4:선택, 5:꾸미기, 6:생성, 7:결과, 100: 카메라로 사진 찍기)
let currentState = 0; 

// 유휴 시간(Timeout) 감지 설정
let lastInputTime = 0; 
const TIMEOUT_LIMIT = 60000;      // 1분 (60,000ms) - 전체 제한 시간
const WARNING_DURATION = 5000;    // 5초 - 경고창이 떠있는 시간

// 시각 효과 변수 (페이드 트랜지션, 컨페티 파티클)
let fadeAlpha = 0; 
let confettis = [];

// [데이터] 사용자 선택 값 (★ LLM 프롬프트의 핵심 재료)
// 예: { category: 'career', goal: '취업...' }
let userSelections = { category: "", goal: "" };

// [상태 플래그] 데이터 로딩 완료 여부 (백엔드 통신용)
let isDataLoaded = false; 

// 이미지 에셋 및 결과물 컨테이너
let imgBgText, imgSun, imgCloud, imgGrass, imgHorse; // 메인 화면용
let stickerImages = []; // 현재 로드된 스티커 세트
let myStickers = [];    // 캔버스에 배치된 스티커 객체들
let finalResultImage;   // 캡처된 최종 결과물 (p5.Graphics)

//api 돌아가는 중
// model 결과

//
let createBTN = null;
let inputName;
let capture;
let cameraImg = null; // 사용자가 촬영한 이미지
let cameraOn = true;
let howmanyCap = 0; // 사진 촬영 하고 저장 안 누르고 뒤로가기 누르면 안 보여줌
// ==================================================================
// 2. 데이터베이스 및 에셋 경로 (Asset & Data)
// ==================================================================

// ★★ [TODO: 실제 이미지 파일 준비] ★★
// data 폴더에 해당 파일들이 실제로 존재해야 오류가 나지 않습니다.
const stickerDatabase = {
  'career': ['data/career_1.png', 'data/career_2.png', 'data/career_3.png'],
  'love':   ['data/love_1.png', 'data/love_2.png', 'data/love_3.png'],
  'relax':  ['data/relax_1.png', 'data/relax_2.png', 'data/relax_3.png'],
  'relation': ['data/relation_1.png', 'data/relation_2.png', 'data/relation_3.png'],
  'adventure': ['data/adventure_1.png', 'data/adventure_2.png', 'data/adventure_3.png'],
  'common': ['data/common_1.png', 'data/common_2.png'] 
};

// 추천 문장 데이터 (초기값은 더미 데이터)
// API 응답이 오면 이 배열이 실제 추천 문장으로 교체됩니다.
let recommendedSentences = [
  "흔들리지 않고 피는 꽃이 어디 있으랴",
  "가장 훌륭한 시는 아직 쓰여지지 않았다",
  "너의 우울이 길지 않기를"
];
let selectedSentence = "";

// [Q1 선택지 데이터]
const q1Data = [
  { key: 'career', label: '[커리어] 꿈이 현실이 되는 시간' },
  { key: 'love',   label: '[사랑] 너를 통해 알아가는 나' },
  { key: 'relax',  label: '[여유] 소란한 세상 속 나 돌보기' },
  { key: 'relation', label: '[관계] 함께의 미학에 대하여' },
  { key: 'adventure', label: '[모험] 낯선 곳으로의 담대한 걸음' }
];

// [Q2 선택지 데이터] (Q1 키값에 종속됨)
const q2Data = {
  'career': [
    { label: '취업: 귀하는 ‘최종 합격’ 하셨습니다.' },
    { label: '대학원: 합격여부 | 합격 Admitted' },
    { label: '시험: 위의 사람은 00시험에 합격하였음을 증명함.' }
  ],
  'love': [
    { label: '짝사랑 성공: 그 사람이 나를 좋아하는 기적이 일어나길.' },
    { label: '연애 시작: 내년 크리스마스는 연인과 함께하길.' },
    { label: '연애 마무리: 웃으며 관계를 정리하게 되길.' },
    { label: '결혼: 내년에는 새로운 가족과 함께이길.' }
  ],
  'relax': [
    { label: '독서와 글쓰기: 텍스트가 나를 한껏 품어주는 한 해.' },
    { label: '음악: 늘 그랬듯 Music is my Life☆' },
    { label: '건강: 건강은 국력이다! 국력을 키우는 한 해.' },
    { label: '휴식: 나태함과 게으름을 만끽하는 한 해.' }
  ],
  'relation': [
    { label: '친구: 우리 우정 가늘고 영원하길.' },
    { label: '가족: 나의 믿을 구석이 더욱 든든해지길.' },
    { label: '스승: 평생 존경하고 싶은 멘토를 만나길.' }
  ],
  'adventure': [
    { label: '해외생활: 머나먼 타국에서 몰랐던 나를 발견하는 한 해.' },
    { label: '독립: 나만의 규칙과 취향으로 나를 정의하는 한 해.' },
    { label: '휴학: 멈추는 게 더 큰 용기임을 기억하며.' }
  ]
};

// 꾸미기 화면 질문

let customQuestions = ['1. 당신의 이름을 입력해주세요.', 
  '2. 어떤 무드를 선호하시나요? (복수 선택 가능)', 
  '3. 원하는 색을 선택해주세요. (한 가지)', 
  '4. 원하는 폰트를 선택해주세요.(한 가지)', 
  '5. 사진을 넣으시겠어요? (선택)'];
let customMood = [
  '귀여운', '병맛스러운','깔끔한','몽환적인','동화적인','사랑스러운','세련된',
  '멋있는','빈티지한','생동감 있는'
];
let customMoodbuttons = [];
let customColorbuttons = [];
let customFontbuttons = [];
let customColor = ['빨강', '주황', '노랑', '분홍', '회색', '초록' , '파랑', '보라', '검정', '하양'];
let customFont = ['폰트1', '폰트2','폰트3', '폰트4','폰트5']
let customResponse = {};
let cameraButton;
// ==================================================================
// 3. p5.js 생명주기 함수 (Lifecycle)
// ==================================================================

function preload() {
  // 초기 이미지 로드 (파일 부재 시 에러 방지를 위한 try-catch)
  try {
    imgBgText = loadImage('data/bg_text.png'); 
    imgSun = loadImage('data/sun.png');
    imgCloud = loadImage('data/cloud.png');
    imgGrass = loadImage('data/grass.png');
    imgHorse = loadImage('data/horse.png');
  } catch (e) { console.log("이미지 로드 오류: data 폴더를 확인하세요."); }
}

function setup() {
  let myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.parent("p5Container");
  lastInputTime = millis();
  
  // 이미지가 없을 경우를 대비해 기본 도형 스티커(더미) 생성
  if (stickerImages.length === 0) {
    stickerImages.push(createDummySticker(color(200), 'ellipse'));
  }

  // input name
  inputName = createInput();
  inputName.position(50, 170);
  inputName.size(800,100);
  inputName.style('position', 'absolute');
  inputName.style('font-size', '24px');
  inputName.style('font-weight', 'bold');
  inputName.style('border', '3px solid black');
  inputName.hide()

  // button _ html
  createBTN = createButton("✅ 이대로 완성");
  createBTN.position(width/2 -80, 1550);
  createBTN.size(160, 60);
  createBTN.style("background-color", "#ffffff");
  createBTN.style("color", "#000000");      
  createBTN.style("font-size", "20px");
  createBTN.style("border-radius", "10px");
  mouseOvercss(createBTN, width/2 -80, 1550, 160, 60); 


  //custom_element button _ mood
  let totalW = width - 50
  for (let i = 0; i < customMood.length; i++) {
    let moodBTN = createButton(customMood[i]);
    moodBTN._value = customMood[i];
    let x = 20 + (i%5)*(totalW/5);
    let y = 370 + int(i/5)*70;
    moodBTN.position(x, y);
    moodBTN.size(totalW/5 - 15, 55);
    moodBTN.style("background-color", "#ffffff");
    moodBTN.style("color", "#000000"); 
    moodBTN.style('font-size', '20px');
    moodBTN.style('border-radius', '10px');
    moodBTN._ispressed = false;
    mouseOvercss(moodBTN, x, y, totalW/5 - 15, 55)
    mouseClcikedcss(moodBTN, x, y,totalW/5 - 15, 55)
    moodBTN.hide()
    customMoodbuttons.push(moodBTN); // 배열에 저장
  }
 
  // custom elemetn button _ color
  
  for (let i = 0; i < customColor.length; i++) {
    let colorBTN = createButton(customColor[i]);
    colorBTN._value = customColor[i];
    let x = 20 + (i%5)*(totalW/5);
    let y = 570 + int(i/5)*70;
    colorBTN.position(x, y);
    colorBTN.size(totalW/5 - 15, 55);
    colorBTN.style("background-color", "#ffffff");
    colorBTN.style("color", "#000000"); 
    colorBTN.style('font-size', '20px');
    colorBTN.style('border-radius', '10px');
    colorBTN._ispressed = false;
    mouseOvercss(colorBTN, x,y,totalW/5 - 15, 55)
    mouseClcikedcss(colorBTN, x,y,totalW/5 - 15, 55)
    colorBTN.hide()
    customColorbuttons.push(colorBTN); // 배열에 저장
  }

  // custom elemetn button _ font
  for (let i = 0; i < customFont.length; i++) {
    let fontBTN = createButton(customFont[i]);
    fontBTN._value = customFont[i]
    let x = 20 + (i%5)*(totalW/5);
    let y = 800 + int(i/5)*70;
    fontBTN.position(x,y);
    fontBTN.size(totalW/5 - 15, 55);
    fontBTN.style("background-color", "#ffffff");
    fontBTN.style("color", "#000000"); 
    fontBTN.style('font-size', '20px');
    fontBTN.style('border-radius', '10px');
    fontBTN._ispressed = false;
    mouseOvercss(fontBTN, x,y,totalW/5 - 15, 55)
    mouseClcikedcss(fontBTN, x,y,totalW/5 - 15, 55)
    fontBTN.hide()
    customFontbuttons.push(fontBTN); // 배열에 저장
  }

  cameraButton = createButton(`📷 눌러서 사진 촬영`)
  cameraButton.position(width/2 - 320, 1000);
  cameraButton.size(640, 480);
  cameraButton.style("background-color", "#ffffff");
  cameraButton.style("font-size", "22px");
  cameraButton.style("border-radius", "15px");
  mouseOvercss(cameraButton, width/2 - 320, 1000, 640, 480);
  cameraButton.hide()

  capture = createCapture(VIDEO);
  capture.size(640,480);
  capture.hide();
  pixelDensity(1);
}

function draw() {
  background(253, 253, 240); // 기본 크림색 배경
  
  // 매 프레임 스타일 초기화 (번쩍거림 및 스타일 오염 방지)
  rectMode(CORNER); 
  imageMode(CORNER); 
  textAlign(LEFT, BASELINE);
  textStyle(NORMAL); 
  
  // 유휴 시간 감지 및 커서 관리
  checkTimeoutAndDrawWarning(); // (주의: 맨 마지막에 그려야 하지만 로직 체크는 여기서 수행)
  updateCursor(); 

  // [상태 머신] 현재 State에 따라 화면 그리기 함수 호출
  switch (currentState) {
    case 0: drawSplash(); break;         // 시작 화면
    case 1: drawQ1(); break;             // 질문 1
    case 2: drawQ2(); break;             // 질문 2
    case 3: drawAILoading(); break;      // AI 로딩 (API 대기)
    case 4: drawSelectSentence(); break; // 문장 선택
    case 5: drawCustomization(); break;  // 꾸미기 (랜덤 배치)
    case 6: drawFinalizing(); break;     // 결과 생성 중
    case 7: drawResult(); break;         // 최종 결과 & QR
    case 100: camera_on(); break;
  }

  // 상단 네비게이션 버튼 (뒤로가기/처음으로) - 특정 화면에서만 노출
  if ([1, 2, 4, 5, 100].includes(currentState)) {
    drawNavButtons();
  }

  // 화면 전환 페이드 효과 적용
  if (fadeAlpha > 0) {
    noStroke();
    fill(253, 253, 240, fadeAlpha); 
    rect(0, 0, width, height);
    fadeAlpha -= 15; 
  }

  // 경고창은 모든 요소의 최상단에 그려야 하므로 다시 호출 (오버레이)
  if (currentState !== 0) {
    let elapsed = millis() - lastInputTime;
    let warningStartTime = TIMEOUT_LIMIT - WARNING_DURATION;
    if (elapsed > warningStartTime && elapsed <= TIMEOUT_LIMIT) {
       drawTimeoutWarning(TIMEOUT_LIMIT - elapsed);
    }
  }
}



// ==================================================================
// 5. 인터랙션 및 로직 (Interaction & Logic)
// ==================================================================

function changeState(newState) {
  currentState = newState;
  fadeAlpha = 255; // 화면 전환 시 페이드 효과 트리거
}

function mousePressed() {
  // 입력 감지: 마우스를 누르는 순간 타임아웃 타이머 리셋
  lastInputTime = millis(); 
  
  // 네비게이션 버튼 동작
  if ([1, 2, 4, 5, 100].includes(currentState)) {
    if (isMouseOverButton(80, 50, 100, 40)) { goBack(); return; }
    if (isMouseOverButton(width - 80, 50, 100, 40)) { resetService(); return; }
  }

  // 화면별 클릭 로직
  if (currentState === 0) changeState(1);
  else if (currentState === 1) {
    // Q1 선택
    let startY = 200; let gap = 90;
    for (let i = 0; i < q1Data.length; i++) {
      if (isMouseOverButton(width/2, startY + (i * gap), 600, 70)) {
        userSelections.category = q1Data[i].key; 
        changeState(2); return;
      }
    }
  }
  else if (currentState === 2) {
    // Q2 선택 -> API 호출 트리거
    let currentOptions = q2Data[userSelections.category];
    if (currentOptions) {
      let startY = 200; let gap = 90;
      for (let i = 0; i < currentOptions.length; i++) {
        if (isMouseOverButton(width/2, startY + (i * gap), 700, 70)) {
          userSelections.goal = currentOptions[i].label; 
          
          loadStickersByCategory(userSelections.category); 
          
          // 백엔드 데이터 요청
          isDataLoaded = false; 
          generateContent(userSelections);
          changeState(3); return;
        }
      }
    }
  }
  else if (currentState === 4) {
    // 문장 선택
    if (isMouseOverButton(width/2, 250, 700, 80)) { selectedSentence = recommendedSentences[0].content; goCustom(); }
    else if (isMouseOverButton(width/2, 350, 700, 80)) { selectedSentence = recommendedSentences[1].content; goCustom(); }
    else if (isMouseOverButton(width/2, 450, 700, 80)) { selectedSentence = recommendedSentences[2].content; goCustom(); }
  }

  else if (currentState === 100) {
    if (cameraOn){
      if (isMouseOverButton(width/2, height/2 + 300, 160, 60)) {
        cameraImg = get(width/2 - 320, height/2 - 240, 640, 480);
        // cameraImg.save('capture_test.jpg');
        cameraOn = !cameraOn
    }}
    else {
      if (isMouseOverButton(width/2 - 120, height/2 + 300, 160, 60)){
        cameraOn = !cameraOn
      }
      else if (isMouseOverButton(width/2 + 120, height/2 + 300, 160, 60)) {
        howmanyCap += 1;
        changeState(5);
      }
    }
  }

  // else if (currentState === 5) {
  //   // 꾸미기 화면 (새로고침 / 완료)
  //   if (isMouseOverButton(width/2 - 150, height - 100, 160, 60)) { 
  //     generateRandomLayout(); 
  //   }
  //   else if (isMouseOverButton(width/2 + 150, height - 100, 160, 60)) { 
  //     captureResult(); 
  //     uploadAndGenerateQR(); // 서버 전송 및 QR 생성 요청
  //     changeState(6); 
  //   }
  // }
  else if (currentState === 7) {
    if (isMouseOverButton(width/2, height - 100, 200, 60)) { resetService(); }
  }
}


// ==================================================================
// 7. 유틸리티 및 클래스 (Utilities & Classes)
// ==================================================================

// 경고창 표시 및 타임아웃 체크 함수
function checkTimeoutAndDrawWarning() {
  // 스플래시 화면(State 0)에서는 타임아웃 체크 안 함
  if (currentState === 0) return;

  let elapsed = millis() - lastInputTime;
  let warningStartTime = TIMEOUT_LIMIT - WARNING_DURATION; // 55초

  if (elapsed > TIMEOUT_LIMIT) {
    // 제한 시간 초과 시 리셋
    resetService();
  } 
  else if (elapsed > warningStartTime) {
    // 경고 구간 진입 시 경고창 표시
    let remainingTime = TIMEOUT_LIMIT - elapsed;
    drawTimeoutWarning(remainingTime);
  }
}

function drawTimeoutWarning(remainingMs) {
  // TODO 
  // custom 요소 선택하는 과정에서 경고문이 그려지는 canvas를 html 위로 올려야 제대로 보임
  if (currentState == 5) {
    const questionArea = select('#questionArea');
    if (questionArea) {questionArea.html("");
      questionArea.style('display', 'none');
      document.body.style.overflowY = "hidden";};
      maintainCustomInputs();
    }
  push();
  // 전체 화면 딤처리 (Dimming)
  fill(0, 0, 0, 150); noStroke(); rectMode(CORNER);
  rect(0, 0, width, height);

  // 중앙 알림 박스
  rectMode(CENTER); fill(255); stroke(0); strokeWeight(2);
  rect(width/2, height/2, 500, 300, 20);

  // 텍스트 표시
  textAlign(CENTER, CENTER); fill(0); noStroke();
  textSize(24); textStyle(BOLD);
  text("입력이 없어 초기 화면으로 돌아갑니다.", width/2, height/2 - 50);

  // 카운트다운 숫자
  textSize(80); fill(255, 100, 100); 
  let seconds = ceil(remainingMs / 1000); 
  text(seconds, width/2, height/2 + 20);

  // 안내
  textSize(18); fill(100); textStyle(NORMAL);
  text("계속하려면 화면을 터치하세요", width/2, height/2 + 100);
  pop();
}

// 버튼 그리기 (스타일 격리 적용)
function drawButton(x, y, w, h, label) {
  push(); 
  rectMode(CENTER); 
  let isHover = isMouseOverButton(x, y, w, h);
  if (isHover) {
    fill(245, 245, 255); stroke(0); strokeWeight(2);
    rect(x, y, w * 1.02, h * 1.05, 10);
    fill(0); noStroke(); textAlign(CENTER, CENTER);
    textSize(label.length > 25 ? 17 : 21); textStyle(BOLD); 
  } else {
    fill(255); stroke(0); strokeWeight(1);
    rect(x, y, w, h, 10);
    fill(0); noStroke(); textAlign(CENTER, CENTER);
    textSize(label.length > 25 ? 16 : 20); textStyle(NORMAL);
  }
  text(label, x, y);
  pop(); 
}

function isMouseOverButton(x, y, w, h) {
  return mouseX > x - w/2 && mouseX < x + w/2 && 
         mouseY > y - h/2 && mouseY < y + h/2;
}

function updateCursor() { cursor(ARROW); }

function goBack() {
  if (currentState === 1) changeState(0);
  else if (currentState === 2) changeState(1);
  else if (currentState === 4) {
    changeState(2);
    modelMessage = null;
    outLoop = true;
    isDataLoaded = false;}

  else if (currentState === 5) 
    {changeState(4);
      const questionArea = select('#questionArea');
    if (questionArea) {questionArea.html("");
      questionArea.style('display', 'none');
      document.body.style.overflowY = "hidden";};
      maintainCustomInputs();
    }
  else if (currentState === 100) {
    if (howmanyCap == 0) {
      cameraImg = null;
      cameraOn = true;}
    changeState(5)}
}

function goCustom() {
  if (selectedSentence !== "") {
    generateRandomLayout();
    changeState(5); 
  }
}

function resetService() {
  const questionArea = select('#questionArea');
  if (questionArea) {            
    questionArea.html("");
    questionArea.style('display', 'none');
    document.body.style.overflowY = "hidden";
  }
  changeState(0);
  myStickers = [];
  confettis = []; 
  selectedSentence = "";
  finalResultImage = null; 
  userSelections = { category: "", goal: "" }; 
  lastInputTime = millis();
  resetCustomInputs()

  cameraOn = true;
  cameraImg = null;
  howmanyCap = 0;
  cameraButton.html(`📷 눌러서 사진 촬영`)
  cameraButton.style("background-image", "none");
  cameraButton.style("background-color", "#ffffff");
  cameraButton.style("font-size", "22px");

  modelMessage = null;
  outLoop = true;
  isDataLoaded = false;
}

// 카테고리에 맞는 스티커 세트 로드 (현재는 더미 로직)
function loadStickersByCategory(category) {
  stickerImages = []; 
  // [TODO: 실제 파일 사용 시 stickerDatabase 경로 활용하여 로드]
  // 이거 tag 어떻게 달고 어떻게 호출할지 다시 이야기해야 함!!!
  // 단순 sticker 로드가 아니라 배경 이미지 / 스티커 구분해서 불러와야 하고
  // 현재 목업으로 만든 화면에서는 무드만 선택하는데, 스티커의 경우엔 직접 보여주고 선택하게 할 것인지?? 
  // 아래 코드는 색깔별 도형으로 대체
  if (category === 'career') {
    stickerImages.push(createDummySticker(color(100, 100, 255), 'rect'));
    stickerImages.push(createDummySticker(color(50, 50, 200), 'rect'));
  } else if (category === 'love') {
    stickerImages.push(createDummySticker(color(255, 150, 150), 'ellipse'));
    stickerImages.push(createDummySticker(color(255, 100, 100), 'ellipse'));
  } else if (category === 'relax') {
    stickerImages.push(createDummySticker(color(100, 200, 100), 'roundRect'));
    stickerImages.push(createDummySticker(color(150, 255, 150), 'roundRect'));
  } else if (category === 'adventure') {
    stickerImages.push(createDummySticker(color(255, 150, 0), 'triangle'));
    stickerImages.push(createDummySticker(color(255, 200, 0), 'triangle'));
  } else {
    stickerImages.push(createDummySticker(color(200, 100, 255), 'ellipse'));
  }
  stickerImages.push(createDummySticker(color(255, 255, 0), 'star'));
}

function createDummySticker(c, shape) {
  let pg = createGraphics(100, 100);
  pg.noStroke(); pg.fill(c);
  if (shape === 'rect') pg.rect(10, 10, 80, 80);
  else if (shape === 'roundRect') pg.rect(10, 10, 80, 80, 20);
  else if (shape === 'ellipse') pg.ellipse(50, 50, 80, 80);
  else if (shape === 'triangle') pg.triangle(50, 10, 10, 90, 90, 90);
  else if (shape === 'star') {
    pg.translate(50, 50);
    for(let i=0; i<5; i++) { pg.ellipse(0, 0, 20, 80); pg.rotate(PI/2.5); }
  }
  return pg;
}

// 결과 화면 캡처 (p5.Graphics 객체 생성)
// TODO 
// 원래 원하던 방식은 임의로 디자인 요소를 가져다가 화면을 구성하는 것이기 때문에 
// 로딩 화면을 띄우고 있을 때 자체적으로 결과물을 보여주는 형태로 구현해야 할 것
// 즉 이 부분의 함수가 구체화되어야 함
// 이미지, 폰트 등을 어떻게 가져올 것인가에 관하여

function captureResult() {
  let pg = createGraphics(width, height);
  pg.background(253, 253, 240);
  for (let s of myStickers) {
    pg.push(); pg.translate(s.x, s.y); pg.imageMode(CENTER);
    pg.image(s.img, 0, 0, s.w, s.h); pg.pop();
  }
  pg.textAlign(CENTER, CENTER); pg.textSize(32); 
  pg.rectMode(CENTER); pg.noStroke(); pg.fill(255, 200);
  let textW = pg.textWidth(selectedSentence) + 40;
  pg.rect(width/2, height/2, textW, 60);
  pg.fill(0); pg.text(`"${selectedSentence}"`, width/2, height/2);
  finalResultImage = pg;
}

// 랜덤 배치 생성기
function generateRandomLayout() {
  myStickers = []; 
  let count = int(random(3, 7)); 
  for (let i = 0; i < count; i++) {
    let rIndex = int(random(stickerImages.length));
    let img = stickerImages[rIndex];
    let x = random(50, width - 50);
    let y = random(50, height - 150);
    myStickers.push(new Sticker(x, y, img));
  }
}
  
// 스티커 클래스
class Sticker {
  constructor(x, y, img) {
    this.x = x; this.y = y; this.img = img;
    this.w = 100; this.h = 100;
  }
  display() {
    push(); translate(this.x, this.y); imageMode(CENTER);
    image(this.img, 0, 0, this.w, this.h); pop();
  }
}

// 컨페티(축하 효과) 클래스
class Confetti {
  constructor() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.size = random(5, 10);
    this.color = color(random(255), random(255), random(255));
    this.speed = random(2, 5);
    this.angle = random(TWO_PI);
  }
  update() {
    this.y += this.speed;
    this.x += sin(this.angle) * 2;
    this.angle += 0.1;
    if (this.y > height) this.y = 0; 
  }
  display() {
    noStroke(); fill(this.color);
    push(); translate(this.x, this.y); rotate(this.angle);
    rect(0, 0, this.size, this.size);
    pop();
  }
}