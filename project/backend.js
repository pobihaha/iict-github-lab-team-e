// ==================================================================
// 6. 백엔드/API 연동 함수 (Backend Integration)
// ==================================================================
let SYSTEM_PROMPT = `실제로 존재하는 책의 문장, 책 제목, 작가만 {}안에 넣은 3개만 하나의 []에 담아 Example처럼 출력해.
Example: [{"content": "", "book": "", "author": ""}, {"content": "", "book": "", "author": ""},{"content": "", "book": "", "author": ""}]`
let modelingLLM = false;
let modelMessage;
/**
 * ★★ [TODO 1: LLM 문장 생성 API 호출] ★★
 * 사용자의 선택(category, goal)을 서버로 보내고, 
 * 추천 문장 3개가 담긴 JSON을 받아와야 합니다.
 */

async function generateContent(selectionData) {
console.log("▶ [API Request] 문장 생성 요청:", selectionData);
modelingLLM = true;
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

fetch(url, {

method: 'POST',

headers: {

'x-goog-api-key': apiKey,

'Content-Type': 'application/json'

    },

body: JSON.stringify({

system_instruction: {

parts: [

          {

text: SYSTEM_PROMPT,

          },

        ],

      },

contents: [

        {

parts: [

            {

text: `${selectionData.category} 중 ${selectionData.goal} 을 한 해의 목표로 가진 사람이 보면 좋을 실제 문학 문장, 책 제목, 작가명을 출력해줘.`,

            },

          ],

        },

      ],

    }),

  })

    .then(response => {

if (!response.ok) {

throw new Error(`HTTP error! status: ${response.status}`);

      }

return response.json();

    })

    .then(data => {

console.log(data);

modelMessage = data.candidates[0].content.parts[0].text;

console.log(modelMessage);

    })

    .catch(error => {

console.error('Error:', error);

    });
modelingLLM = false;
// modelMessage = parseModelMessage(modelMessage);
}


// model 로 받아온 text 를 list 형태로 만들기 위한 함수
function parseModelMessage(msg) {
  console.log('start parsing');
  let startIdx = msg.indexOf("[");
  let endIdx = msg.indexOf("]");

  if (startIdx === -1 || endIdx === -1) {
    console.error("형태가 올바르지 않습니다.");
    // modelMiss = true;
    return null;
  }
  let jsonStr = msg.substring(startIdx, endIdx + 1);
  jsonStr = jsonStr.replace(/'/g, '"');
  let arr;
  try {
    arr = JSON.parse(jsonStr);
    // modelMiss = false;
    return arr;
  } catch (e) {
    console.error("JSON 변환 실패:", e);
    // modelMiss = true;
    return null;
  }
}

/**
 * ★★ [TODO 2: 이미지 업로드 및 QR 생성] ★★
 * finalResultImage(p5.Graphics)를 서버에 업로드하고,
 * 그 URL을 담은 QR 코드를 생성해야 합니다.
 */
function uploadAndGenerateQR() {
  console.log("▶ [Server Request] 이미지 업로드 및 QR 생성 요청");
  
  /* [구현 가이드]
  finalResultImage.canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('file', blob);
    
    // 서버 업로드 API 호출 (예: Cloudinary, Supabase Storage)
    // QR 코드 생성 API 호출
  });
  */
}