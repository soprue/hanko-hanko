#!/usr/bin/env node
const fs = require('fs');

// 커밋 메시지 형식을 정의합니다.
const commitMessagePattern =
  /^(feat|update|fix|!break|!hotfix|style|refactor|comment|chore|docs|test|rename|remove): .{1,50}$/;

// 커밋 메시지를 읽어옵니다.
const commitMessage = fs.readFileSync(process.argv[2], 'utf-8').trim();

// 커밋 메시지 형식을 검증합니다.
if (!commitMessagePattern.test(commitMessage)) {
  console.error(`
  ❌ 커밋 메시지 형식이 맞지 않습니다!

  ===================== 반드시 콜론 한 개(:)를 사용하고 띄어쓰기 후 내용을 입력합니다. =====================  
  feat:             새로운 기능 추가
  update:           기능 수정
  fix:              버그 수정
  !break:           커다란 API 변경의 경우
  !hotfix:          급하게 치명적인 버그를 고쳐야하는 경우
  style:            CSS 및 UI, 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우
  refactor:         코드 리팩토링 (기능 변경 X, 코드 가독성, 구조, 품질 개선의 경우)
  comment:          필요한 주석 추가 및 변경
  chore:            빌드 업무 수정, 패키지 매니저 수정
  docs:             문서 수정
  test:             빌드 업무 수정, 패키지 매니저 수정, 패키지 관리자 수정 등 업데이트, Production Code 변경 없음
  rename:           파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
  remove:           파일을 삭제하는 작업만 수행한 경우
  ==============================================================================================

  형식 예시: feat: 로그인 버튼 추가
  `);
  process.exit(1); // 검증 실패 시 프로세스를 종료합니다.
}

process.exit(0); // 성공적으로 완료되면 프로세스를 종료합니다.
