import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // 여행 코스 추천
  async recommendCourse(
    accommodation: any,
    places: any[],
    userCondition: any,
  ) {
    const prompt = `
너는 여행 코스를 추천하는 AI다.

사용자가 선택한 여행 조건은 다음과 같다.

${JSON.stringify(userCondition, null, 2)}

사용자가 선택한 숙소는 다음과 같다.

${JSON.stringify(accommodation, null, 2)}

다음 장소들은 우리 서비스 데이터베이스에 실제로 저장되어 있는 장소들이다.

${JSON.stringify(places, null, 2)}

반드시 위 장소 목록에 존재하는 장소만 사용해서 여행 코스를 구성해야 한다.
절대로 데이터베이스에 존재하지 않는 새로운 장소를 추가하지 마라.

숙소를 출발점으로 고려하여 자연스러운 여행 동선이 되도록 장소를 배열하라.
각 장소의 latitude와 longitude를 참고하여 장소 간 이동 동선을 고려하라.
사용자가 선택한 이동수단을 고려하라.

사용자가 무장애 유형(barrierFreeTypes)을 선택했다면, 제공된 장소 목록은 1차적으로 숫자 플래그 기준을 통과한 장소들이다.
각 장소의 barrierFreeInfo 필드에는 실제 시설 안내 텍스트(예: "주출입구는 턱이 없어 휠체어 접근 가능함")가 담겨 있을 수 있다.
반드시 이 텍스트를 직접 읽고, 사용자가 선택한 무장애 유형에 실제로 적합한 시설인지 다시 한번 판단하라.
barrierFreeInfo가 null이거나 텍스트 내용이 없고, 관련 정보가 전혀 확인되지 않는 장소는 무장애 코스에서 제외하라.
텍스트 내용이 오히려 접근이 어렵다는 것을 암시하는 경우에도 제외하라.
각 장소의 hasNightEvent가 true이면 야간에도 즐길 수 있는 장소다. 사용자가 테마에 '야간(NIGHT)'을 선택했다면 hasNightEvent가 true인 장소를 우선적으로 포함하라.
각 장소의 congestionLevel도 고려하여 가능하면 혼잡도가 낮은 장소를 우선적으로 고려하라.
사용자가 선택한 테마와 가장 잘 맞는 장소를 선택하라.

최종적으로 3~5개의 장소를 선택하여 하나의 여행 코스를 만들어라.

반드시 아래 JSON 형식으로만 응답하라.

{
  "course": [
    {
      "place_code": 12345,
      "order": 1,
      "reason": "이 장소를 추천한 이유"
    },
    {
      "place_code": 67890,
      "order": 2,
      "reason": "이 장소를 추천한 이유"
    }
  ],
  "summary": "전체 여행 코스에 대한 설명"
}

중요한 규칙:
1. place_code는 반드시 제공된 장소 목록에 존재하는 값이어야 한다.
2. 제공된 장소 목록에 없는 장소의 place_code를 절대로 사용하지 마라.
3. 장소 이름을 임의로 변경하지 마라.
4. 최종 코스에는 3~5개의 장소를 포함하라.
5. 숙소 자체를 관광 장소로 추천하지 마라.
6. 장소의 이동 순서를 고려하라.
7. 선택한 이동수단을 고려하라.
8. JSON 이외의 설명은 작성하지 마라.
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleanedText);
    } catch (error) {
      return {
        raw: text,
        message: 'Gemini 응답을 JSON으로 변환하지 못했습니다.',
      };
    }
  }

  // 여행객 인증 증빙 이미지 판별

  async verifyTravelerDocument(
    imageBuffer: Buffer,
    documentType:
      | 'TRANSPORT_TICKET'
      | 'TOLL_RECEIPT'
      | 'HOTEL_RESERVATION',
    mimeType: string,
  ): Promise<{
    valid: boolean;
    documentType:
      | 'TRANSPORT_TICKET'
      | 'TOLL_RECEIPT'
      | 'HOTEL_RESERVATION'
      | null;
    confidence: number;
    reason: string;
    raw?: string;
  }> {
    const todayStr = new Date().toISOString().split('T')[0];
    const prompt = `
너는 여행객의 실제 여행 증빙 이미지를 판별하는 AI다.
제출된 이미지는 OCR 자동 인식을 통해 즉시 검증되므로, 이미지 안의 텍스트 정보를 최대한 정확하게 읽어서 판단해야 한다.

오늘 날짜는 ${todayStr}이다.

사용자가 시스템에서 선택한 증빙 종류:

${documentType}

이미지를 자세히 분석하여 어떤 종류의 증빙인지 판단하라.

증빙 종류:

1. TRANSPORT_TICKET
다음과 같은 교통 이용 증빙을 포함한다.
- 기차표, KTX, SRT, ITX, 무궁화호, 일반 열차 승차권 및 예약 확인서
- 버스, 고속버스, 시외버스 승차권
- 항공권 및 항공 예약 확인서
- 기타 여행 중 실제 교통수단을 이용했다는 것을 보여주는 승차권

기차표의 경우 열차명, 열차 번호, 출발역, 도착역, 출발 날짜/시간, 좌석 번호, 승객 이름, 승차권 번호, 예약 번호, 운임, QR 코드/바코드 등이 포함될 수 있다. 위 정보가 모두 존재할 필요는 없으며, 기차표임을 판단할 수 있는 충분한 정보가 있다면 TRANSPORT_TICKET으로 인정하라.

TRANSPORT_TICKET에 한해 아래 추가 규칙을 반드시 적용하라:

- 캡처본에는 출발지, 도착지, 승차 일시가 명확하게 보여야 한다. 이 세 가지 정보 중 하나라도 이미지에서 읽을 수 없거나 가려져 있다면 valid를 false로 판단하라.
- 승차 일시는 오늘(${todayStr}) 기준 최근 3일 이내여야 한다. 승차 일시가 오늘로부터 3일을 초과하여 지난 경우, 혹은 아직 오지 않은 미래 날짜인 경우 valid를 false로 판단하라.
- 출발지가 '대전' 외의 지역이고, 도착지가 '대전'인 경우에만 유효한 증빙으로 인정하라. 출발지와 도착지가 이 조건에 맞지 않으면(예: 대전에서 출발했거나, 대전이 도착지가 아닌 경우) valid를 false로 판단하라.
- 위 세 가지 조건(정보 명확성, 3일 이내 여부, 출발/도착지 조건)을 모두 만족해야만 TRANSPORT_TICKET을 최종적으로 valid: true로 판단할 수 있다. 하나라도 어긋나면 valid는 false이며, reason에 구체적으로 어떤 조건을 충족하지 못했는지 명시하라.

2. TOLL_RECEIPT
다음과 같은 통행료 관련 증빙을 포함한다.
- 고속도로 통행료 영수증, 톨게이트 통과 영수증, 하이패스 이용 내역 및 요금 결제 영수증

3. HOTEL_RESERVATION
다음과 같은 숙박 관련 증빙을 포함한다.
- 호텔 및 숙소 예약 확인서, 예약 내역, 숙박 예약 영수증, 숙박 플랫폼 예약 화면(체크인/체크아웃 날짜 표시)

판정 규칙:

1. 먼저 이미지가 실제 여행 증빙 문서인지 판단하라.
2. 일반적인 풍경 사진, 관광지 사진, 음식 사진, 셀카, 일반 화면 캡처 등은 증빙으로 인정하지 마라.
3. 사용자가 선택한 documentType과 이미지의 실제 증빙 종류가 일치하는지 판단하라.
4. TRANSPORT_TICKET의 경우 기차표, KTX, SRT, 버스표, 항공권 등을 정상적인 교통 증빙으로 인정하되, 위에 명시된 TRANSPORT_TICKET 추가 규칙(정보 명확성, 3일 이내, 출발지/도착지 조건)을 반드시 함께 적용하라.
5. 기차표라고 판단할 수 있는 정보가 충분히 있다면 문서의 디자인이나 형식이 일반적인 기차표와 다르더라도 TRANSPORT_TICKET으로 인정하라 (단, 추가 규칙은 그대로 적용).
6. 이미지가 약간 흐리거나 일부 글자가 잘리지 않았더라도 전체적인 증빙 종류를 판단할 수 있다면 인정할 수 있다. 단, TRANSPORT_TICKET의 출발지/도착지/승차일시는 예외 없이 명확히 읽혀야 한다.
7. 이미지가 완전히 흐려서 증빙 종류 자체를 판단할 수 없는 경우에는 valid를 false로 판단하라.
8. 증빙 종류가 명확하지 않은 경우에는 documentType을 null로 설정하라.
9. confidence는 0부터 1 사이의 숫자로 작성하라.
10. 사용자가 선택한 documentType과 실제 이미지의 종류가 일치하고, 해당 증빙 종류의 모든 조건을 만족하면 valid는 true로 판단하라.
11. 사용자가 선택한 documentType과 실제 이미지의 종류가 다르거나, 해당 조건을 하나라도 만족하지 못하면 valid는 false로 판단하라.
12. 반드시 JSON만 반환하라.

중요:

예를 들어 사용자가 TRANSPORT_TICKET을 선택했고 이미지가 대전 외 지역에서 대전으로 오는 KTX 승차권이며, 오늘로부터 2일 전 승차 기록이고 출발지/도착지/일시가 모두 명확하다면:
{
  "valid": true,
  "documentType": "TRANSPORT_TICKET",
  "confidence": 0.95,
  "reason": "출발지 서울, 도착지 대전, 승차일시가 오늘로부터 2일 전으로 확인되어 조건을 충족하는 교통 이용 증빙으로 판단됩니다."
}

예를 들어 사용자가 TRANSPORT_TICKET을 선택했지만 승차일시가 오늘로부터 5일 전이라면:
{
  "valid": false,
  "documentType": "TRANSPORT_TICKET",
  "confidence": 0.9,
  "reason": "승차일시가 오늘(${todayStr}) 기준 3일을 초과하여 지났으므로 인증 기간 조건을 충족하지 못합니다."
}

예를 들어 사용자가 TRANSPORT_TICKET을 선택했지만 출발지가 대전이고 도착지가 서울이라면:
{
  "valid": false,
  "documentType": "TRANSPORT_TICKET",
  "confidence": 0.9,
  "reason": "출발지가 대전이고 도착지가 대전이 아니므로 조건(대전 외 지역 → 대전)을 충족하지 못합니다."
}

예를 들어 사용자가 TRANSPORT_TICKET을 선택했지만 이미지가 호텔 예약 확인서라면:
{
  "valid": false,
  "documentType": "HOTEL_RESERVATION",
  "confidence": 0.95,
  "reason": "숙박 예약 정보가 확인되어 교통 티켓이 아닌 호텔 예약 증빙으로 판단됩니다."
}

반드시 다음 JSON 구조만 반환하라.

{
  "valid": true,
  "documentType": "TRANSPORT_TICKET",
  "confidence": 0.95,
  "reason": "판별 이유"
}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text ?? '';
      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      const allowedTypes = [
        'TRANSPORT_TICKET',
        'TOLL_RECEIPT',
        'HOTEL_RESERVATION',
      ];

      const detectedType = allowedTypes.includes(parsed.documentType)
        ? parsed.documentType
        : null;

      const confidence =
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0;

      return {
        valid:
          parsed.valid === true &&
          detectedType !== null &&
          detectedType === documentType,
        documentType: detectedType,
        confidence,
        reason: parsed.reason ?? '판별 이유가 제공되지 않았습니다.',
      };
    } catch (error) {
      return {
        valid: false,
        documentType: null,
        confidence: 0,
        reason: 'Gemini 증빙 판별에 실패했습니다.',
        raw: String(error),
      };
    }
  }

  // 숙소 예약 확인서 이미지 분석 (체크인/체크아웃 날짜 추출)

  async verifyStayReservation(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<{
    valid: boolean;
    confidence: number;
    checkIn: string | null;
    checkOut: string | null;
    reason: string;
  }> {
    const prompt = `
너는 숙소 예약 확인서 이미지를 분석하는 AI다.

이미지는 호텔, 게스트하우스, 펜션, 리조트 등 숙박 시설의 예약 확인서 또는
예약 내역 화면(체크인/체크아웃 날짜가 표시된 화면)이어야 한다.

판정 규칙:

1. 이미지가 실제 숙소 예약 확인서 또는 예약 내역 화면인지 판단하라.
2. 일반적인 풍경 사진, 숙소 외관/내부 사진, 셀카, 관련 없는 화면 캡처는
   증빙으로 인정하지 마라.
3. 이미지에서 체크인 날짜와 체크아웃 날짜를 추출하라.
4. 날짜 형식은 반드시 YYYY-MM-DD로 작성하라.
5. 체크인 또는 체크아웃 날짜를 이미지에서 명확히 확인할 수 없다면
   해당 필드를 null로 설정하라.
6. 이미지가 예약 확인서가 아니거나, 체크인/체크아웃 날짜를 전혀
   확인할 수 없다면 valid를 false로 설정하라.
7. 이미지가 예약 확인서이고 체크인/체크아웃 날짜를 모두 확인할 수
   있다면 valid를 true로 설정하라.
8. confidence는 0부터 1 사이의 숫자로 작성하라.
9. 반드시 아래 JSON 형식으로만 응답하라. 다른 설명은 작성하지 마라.

{
  "valid": true,
  "confidence": 0.95,
  "checkIn": "2026-08-10",
  "checkOut": "2026-08-12",
  "reason": "판별 이유"
}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text ?? '';
      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

      const checkIn =
        typeof parsed.checkIn === 'string' && dateFormat.test(parsed.checkIn)
          ? parsed.checkIn
          : null;

      const checkOut =
        typeof parsed.checkOut === 'string' && dateFormat.test(parsed.checkOut)
          ? parsed.checkOut
          : null;

      const confidence =
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0;

      return {
        valid: parsed.valid === true && checkIn !== null && checkOut !== null,
        confidence,
        checkIn,
        checkOut,
        reason: parsed.reason ?? '판별 이유가 제공되지 않았습니다.',
      };
    } catch (error) {
      return {
        valid: false,
        confidence: 0,
        checkIn: null,
        checkOut: null,
        reason: 'Gemini 예약 증빙 판별에 실패했습니다.',
      };
    }
  }
}
