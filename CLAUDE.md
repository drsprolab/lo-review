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
- PRO-AX Lab Review와 **같은 구글 시트·Apps Script**를 쓰고, 탭만 따로: `lo_reviews`, `lo_concept_maps` (`TABLE_NAMES` in `js/api.js`)
- 도식 이미지는 드라이브 'LO_Review 도식' 폴더 (업로드 요청에 `folder: 'lo'`)
- Apps Script 코드는 `proax-lab-review/apps-script/Code.gs` 한 곳에서 관리 (TABLES에 lo_ 탭 포함). 코드를 고치면 교수님이 편집기에 붙여넣고 **배포 → 배포 관리 → 수정 → 새 버전 → 배포** (주소 그대로)

## 배포
GitHub Pages (main 브랜치 루트). push 하면 1~2분 뒤 반영.
