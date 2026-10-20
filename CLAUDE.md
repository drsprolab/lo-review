# LO_Review — 작업 인수인계

학습조직 수업(DET9111) 논문 리뷰 제출·열람 사이트. 주소: https://hrdpro.hanyang.ac.kr/lo-review/
PRO-AX Lab Review(`drsprolab/proax-lab-review`, /proax-lab-review/)를 복사해 만든 사이트로, 기능은 같다. 사용자와는 **한국어**로 대화한다.

## 사용자가 정한 것 (다시 묻지 말 것)
- 사이트 이름(브랜드·탭 제목): **LO_Review** / 대문 제목: **Learning Org. Review**
- 대문 문구: "학습조직 수업을 위한 논문 리뷰 입니다. 나의 생각이 우리의 생각을 바꿉니다."
- 주의사항: PRO-AX Lab Review와 동일 (SSCI만 · 본인의 인지적 노력 · 시간엄수)
- 일정: **일요일 논문 리뷰 — 매주 일요일 밤 11:59까지**, **Conceptual Map — 지정 제출시간 별도 공지**
- **제출물은 교수님이 직접 지우라고 할 때까지 절대 지우거나 리셋하지 않는다** (자동 삭제 기능 없음, 삭제는 구글 시트에서)
- 같은 주차 제출물은 **다음 주 월요일 0시**에 한 묶음(접힌 묶음)으로 정리 (`FOLD_AFTER`, `FOLD_HOUR` in `js/app.js`)
- 주차 표시는 **수업 주차**: 2026-10-19(월)~10-25(일)이 **9주차** (`COURSE_WEEK1` = 2026-08-24, `courseWeek()` in `js/api.js`). 저장값 `week_key`는 ISO 주차(`2026-W43`) 그대로
- 임시 저장 키는 PRO-AX와 겹치지 않게 `lo-review-*`, `lo-concept-*` (같은 도메인이라 localStorage 공유됨)

## 저장소
- **PRO-AX Lab Review와 완전히 별도로 운영** (교수님 결정, 2026-10-20). 시트·Apps Script·드라이브 폴더 모두 따로
- LO_Review 전용 구글 시트 + `apps-script/Code.gs` (탭: reviews, concept_maps / 도식 폴더: 'LO_Review 도식')
- `js/api.js`의 `GAS_URL`에 LO_Review 전용 웹앱 …/exec 주소를 넣는다. 비어 있으면 미리보기 모드(이 브라우저에만 저장, 안내 띠 표시)
- Apps Script 코드를 고치면 교수님이 편집기에 붙여넣고 **배포 → 배포 관리 → 수정 → 새 버전 → 배포** (주소 그대로)

## 배포
GitHub Pages (main 브랜치 루트). push 하면 1~2분 뒤 반영.

## 학술지 자동 점검 (2026-10-20)
- APA 입력 시 MDPI·Frontiers 계열이거나 SSCI 미등재면 빨간 경고(`#jcheckWarn`)를 띄우고 확인·제출 버튼을 막음. `js/journal-check.js` (PRO-AX Lab Review와 같은 파일)
- SSCI 목록은 `data/ssci.json` (`{version, journals:[{title, issn, eissn}]}`). 파일이 없으면 SSCI 검사는 건너뜀
- **2026-10-20 교수님 결정: SSCI 미등재 차단은 보류.** `data/ssci.json`을 만들지 말 것(파일이 없으면 검사가 꺼진 상태). 다시 하라고 할 때만 Clarivate SSCI 목록으로 파일 생성

## Sample 묶음 (2026-10-20)
- PRO-AX Lab Review의 김예서·김재현 리뷰 2편을 이 시트(reviews)에 **복사**해 작성 예시로 씀. 대문 맨 위 'Sample' 접힌 묶음, 주차 묶음·전체 편수에서 제외
- `SAMPLE_IDS` in `js/app.js` (이 시트의 id: 김예서 c5374508…, 김재현 db8b1498…). 원본(PRO-AX 시트)을 고쳐도 여기는 바뀌지 않음
- **제출 후 대문으로 이동** (2026-10-20): 제출이 끝나면 `index.html?submitted=<id>&kind=reviews|maps`로 옮겨 그 카드가 든 묶음을 펼치고 '방금 제출'로 강조(`PL.showSubmitted` → `markSubmitted` in `js/app.js`). 제출 완료 화면(doneBar)은 더 이상 쓰지 않음 — PDF는 제출 전 확인 화면의 'PDF로 받기'
