// state 5에서 쓰는 함수들

function mouseOvercss(btn, x, y, w, h) {
  btn.elt.addEventListener("mouseenter", function() {
    if (!btn._ispressed) {
  btn.size(w*1.02, h*1.02);
  btn.position(x-w*0.01, y-h*0.01);
  btn.style("background-color", "#f5f5ff");
  btn.style("font-size", "21px");
  btn.style("font-weight", "bold");
}});

  btn.elt.addEventListener("mouseleave", function() {
    if (!btn._ispressed) {
  btn.position(x,y);
  btn.size(w, h);
  btn.style("background-color", "#ffffff");
  btn.style("font-size", "20px");
  btn.style("font-weight", "normal");
}}); 
}

  
function mouseClcikedcss(btn, x,y, w,h) {
  btn.mousePressed(() => {
    btn._ispressed = !btn._ispressed;
    if (!btn._ispressed) {
      btn.position(x,y)
      btn.size(w, h);
      btn.style("background-color", "#ffffff");
      btn.style("font-size", "20px");
      btn.style("font-weight", "normal");
    } else {
      btn.size(w*1.02, h*1.02);
      btn.position(x - w*0.01, y-0.01*h)
      btn.style("background-color", "#f5f5ff");
      btn.style("font-size", "21px");
      btn.style("font-weight", "bold");
    }

  if (customFontbuttons.includes(btn)) {
    let idx = customFontbuttons.indexOf(btn);
    for(let i=0;i<customFontbuttons.length;i++){
      if (i!==idx && customFontbuttons[i]._ispressed == true){
        let chn_btn = customFontbuttons[i]
        chn_btn._ispressed = false;
        let x = chn_btn.elt.offsetLeft;
        let y = chn_btn.elt.offsetTop;
        let w = (width - 50)/5 - 15;
        let h = 55;
        chn_btn.position(x+0.01*w, y+0.01*h);
        chn_btn.size(w,h);
        chn_btn.style("background-color", "#ffffff");
        chn_btn.style("font-size", "20px");
        chn_btn.style("font-weight", "normal");
      }
    }
  }
  else if (customColorbuttons.includes(btn)) {
    let idx = customColorbuttons.indexOf(btn);
    for(let i=0;i<customColorbuttons.length;i++){
      if (i!==idx && customColorbuttons[i]._ispressed == true){
        let chn_btn = customColorbuttons[i]
        chn_btn._ispressed = false;
        let x = chn_btn.elt.offsetLeft;
        let y = chn_btn.elt.offsetTop;
        let w = (width - 50)/5 - 15;
        let h = 55;
        chn_btn.position(x+0.01*w, y+0.01*h);
        chn_btn.size(w,h);
        chn_btn.style("background-color", "#ffffff");
        chn_btn.style("font-size", "20px");
        chn_btn.style("font-weight", "normal");
      }
    }
  }
  
})};


function camera_on(){
  textAlign(CENTER); textSize(20); noStroke(); fill(0);
  text("촬영 버튼을 눌러 사진을 찍어주세요!", width/2, 50);

  if (cameraOn) {
  capture.loadPixels();
  push();
  translate(width/2 + 320, height/2 - 240);
  scale(-1,1);
  image(capture, 0, 0, 640, 480);
  pop();

  drawButton(width/2, height/2 + 300, 160, 60, '촬영하기');
}
  else {
  image(cameraImg, width/2 -320, height/2 -240, 640, 480);
  
  drawButton(width/2 - 120, height/2 + 300, 160, 60, '다시찍기');
  drawButton(width/2 + 120, height/2 + 300, 160, 60, '저장하기');
  }
   
  
}


// 커스텀 된 것들 초기화
function resetCustomInputs() {
  inputName.value(''); 
  inputName.hide();
  let totalW = width - 50;

  for (let mbtn of customMoodbuttons) {
    mbtn._ispressed = false;
    mbtn.size(totalW/5 - 15, 55);
    mbtn.style("background-color", "#ffffff");
    mbtn.style("font-size", "20px");
    mbtn.style("font-weight", "normal");
    mbtn.hide();                  
  }

  for (let cbtn of customColorbuttons) {
    cbtn._ispressed = false;
    cbtn.size(totalW/5 - 15, 55);
    cbtn.style("background-color", "#ffffff");
    cbtn.style("font-size", "20px");
    cbtn.style("font-weight", "normal");
    cbtn.hide();                  
  }

  for (let fbtn of customFontbuttons) {
    fbtn._ispressed = false;
    fbtn.size(totalW/5 - 15, 55);
    fbtn.style("background-color", "#ffffff");
    fbtn.style("font-size", "20px");
    fbtn.style("font-weight", "normal");
    fbtn.hide();                  
  }
  
}

//선택지 유지 - 이전화면으로 돌아갈 때
// 커스텀 된 것들 초기화
function maintainCustomInputs() {
  inputName.hide();
  let totalW = width - 50;

  for (let mbtn of customMoodbuttons) {
    mbtn.hide();                  
  }

  for (let cbtn of customColorbuttons) {
    cbtn._ispressed = false;-
    cbtn.hide();                  
  }

  for (let fbtn of customFontbuttons) {
    fbtn._ispressed = false;
    fbtn.hide();                  
  }
}