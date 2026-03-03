export interface EmojiEntry {
  emoji: string;
  keywords: string[];
  category: string;
}

export const EMOJI_KO_DATA: EmojiEntry[] = [
  // ── 공부 / 학습 ──
  { emoji: "📚", keywords: ["공부", "책", "독서", "학습", "스터디", "book", "study"], category: "공부" },
  { emoji: "📖", keywords: ["책", "읽기", "독서", "공부", "book"], category: "공부" },
  { emoji: "✏️", keywords: ["연필", "필기", "공부", "메모", "pencil"], category: "공부" },
  { emoji: "📝", keywords: ["노트", "필기", "메모", "작성", "note"], category: "공부" },
  { emoji: "🖊️", keywords: ["펜", "필기", "메모", "pen"], category: "공부" },
  { emoji: "📓", keywords: ["공책", "노트", "필기", "notebook"], category: "공부" },
  { emoji: "📒", keywords: ["노트북", "기록", "공부"], category: "공부" },
  { emoji: "🎓", keywords: ["졸업", "학위", "대학", "공부", "graduation"], category: "공부" },
  { emoji: "🏫", keywords: ["학교", "교육", "school"], category: "공부" },
  { emoji: "🔬", keywords: ["과학", "실험", "연구", "microscope"], category: "공부" },
  { emoji: "🔭", keywords: ["천문", "우주", "망원경"], category: "공부" },
  { emoji: "📐", keywords: ["수학", "수업", "도구"], category: "공부" },
  { emoji: "📊", keywords: ["통계", "데이터", "분석", "차트"], category: "공부" },
  { emoji: "📈", keywords: ["성장", "분석", "통계", "상승"], category: "공부" },

  // ── 운동 / 건강 ──
  { emoji: "💪", keywords: ["운동", "근육", "헬스", "힘", "강함", "gym"], category: "운동" },
  { emoji: "🏃", keywords: ["달리기", "조깅", "러닝", "운동", "run"], category: "운동" },
  { emoji: "🏋️", keywords: ["헬스", "운동", "웨이트", "역도", "gym"], category: "운동" },
  { emoji: "🧘", keywords: ["요가", "명상", "스트레칭", "yoga"], category: "운동" },
  { emoji: "⚽", keywords: ["축구", "soccer", "공"], category: "운동" },
  { emoji: "🏀", keywords: ["농구", "basketball"], category: "운동" },
  { emoji: "🎾", keywords: ["테니스", "tennis"], category: "운동" },
  { emoji: "🏊", keywords: ["수영", "swim"], category: "운동" },
  { emoji: "🚴", keywords: ["자전거", "사이클링", "bike"], category: "운동" },
  { emoji: "🥊", keywords: ["복싱", "격투", "boxing"], category: "운동" },
  { emoji: "⛹️", keywords: ["농구", "스포츠", "선수"], category: "운동" },
  { emoji: "🤸", keywords: ["체조", "스트레칭", "유연성"], category: "운동" },
  { emoji: "🏄", keywords: ["서핑", "파도", "surf"], category: "운동" },
  { emoji: "🧗", keywords: ["클라이밍", "등반", "산"], category: "운동" },

  // ── 코딩 / 개발 ──
  { emoji: "💻", keywords: ["컴퓨터", "노트북", "코딩", "개발", "programming", "laptop"], category: "개발" },
  { emoji: "🖥️", keywords: ["컴퓨터", "모니터", "데스크탑", "desktop"], category: "개발" },
  { emoji: "⌨️", keywords: ["키보드", "타이핑", "코딩", "keyboard"], category: "개발" },
  { emoji: "🖱️", keywords: ["마우스", "클릭", "mouse"], category: "개발" },
  { emoji: "🚀", keywords: ["로켓", "발사", "시작", "출시", "프로젝트", "rocket"], category: "개발" },
  { emoji: "🔧", keywords: ["도구", "설정", "수리", "개발", "tool"], category: "개발" },
  { emoji: "⚙️", keywords: ["설정", "기어", "개발", "작업", "gear"], category: "개발" },
  { emoji: "🐛", keywords: ["버그", "에러", "오류", "bug"], category: "개발" },
  { emoji: "🔌", keywords: ["플러그인", "연결", "plugin"], category: "개발" },
  { emoji: "📱", keywords: ["모바일", "앱", "스마트폰", "phone"], category: "개발" },
  { emoji: "🌐", keywords: ["웹", "인터넷", "글로벌", "web"], category: "개발" },
  { emoji: "🗄️", keywords: ["서버", "데이터베이스", "server", "database"], category: "개발" },

  // ── 목표 / 성취 ──
  { emoji: "🎯", keywords: ["목표", "타겟", "도전", "목적", "goal"], category: "목표" },
  { emoji: "🏆", keywords: ["트로피", "우승", "성공", "달성", "trophy", "win"], category: "목표" },
  { emoji: "🥇", keywords: ["1등", "금메달", "우승", "최고", "first"], category: "목표" },
  { emoji: "⭐", keywords: ["별", "최고", "스타", "star"], category: "목표" },
  { emoji: "🌟", keywords: ["별빛", "특별", "빛남", "star"], category: "목표" },
  { emoji: "✅", keywords: ["완료", "체크", "완성", "done", "check"], category: "목표" },
  { emoji: "💡", keywords: ["아이디어", "생각", "발견", "idea"], category: "목표" },
  { emoji: "📌", keywords: ["고정", "중요", "메모", "pin"], category: "목표" },
  { emoji: "🔑", keywords: ["열쇠", "해결", "key", "answer"], category: "목표" },
  { emoji: "💎", keywords: ["다이아몬드", "가치", "귀중", "diamond"], category: "목표" },
  { emoji: "🎖️", keywords: ["메달", "훈장", "성과", "medal"], category: "목표" },

  // ── 팀 / 소통 ──
  { emoji: "👥", keywords: ["팀", "그룹", "사람들", "team"], category: "팀" },
  { emoji: "🤝", keywords: ["악수", "협력", "팀워크", "handshake"], category: "팀" },
  { emoji: "💬", keywords: ["채팅", "대화", "소통", "chat"], category: "팀" },
  { emoji: "📣", keywords: ["공지", "알림", "발표", "announce"], category: "팀" },
  { emoji: "🔔", keywords: ["알림", "벨", "bell", "notification"], category: "팀" },
  { emoji: "🎤", keywords: ["마이크", "발표", "말하기", "mic"], category: "팀" },

  // ── 음악 / 예술 ──
  { emoji: "🎵", keywords: ["음악", "노래", "뮤직", "music"], category: "예술" },
  { emoji: "🎶", keywords: ["음악", "멜로디", "노래", "music"], category: "예술" },
  { emoji: "🎸", keywords: ["기타", "음악", "guitar"], category: "예술" },
  { emoji: "🎹", keywords: ["피아노", "건반", "음악", "piano"], category: "예술" },
  { emoji: "🥁", keywords: ["드럼", "음악", "drum"], category: "예술" },
  { emoji: "🎨", keywords: ["예술", "그림", "디자인", "art", "paint"], category: "예술" },
  { emoji: "🖌️", keywords: ["붓", "그림", "페인팅", "brush"], category: "예술" },
  { emoji: "📸", keywords: ["사진", "카메라", "photo", "camera"], category: "예술" },
  { emoji: "🎬", keywords: ["영화", "촬영", "film", "movie"], category: "예술" },
  { emoji: "🎮", keywords: ["게임", "플레이", "game"], category: "예술" },

  // ── 과일 ──
  { emoji: "🍎", keywords: ["사과", "빨간사과", "과일", "apple"], category: "과일" },
  { emoji: "🍊", keywords: ["귤", "오렌지", "과일", "orange", "tangerine"], category: "과일" },
  { emoji: "🍋", keywords: ["레몬", "시트러스", "과일", "lemon"], category: "과일" },
  { emoji: "🍋‍🟩", keywords: ["라임", "시트러스", "과일", "lime"], category: "과일" },
  { emoji: "🍇", keywords: ["포도", "grape", "과일"], category: "과일" },
  { emoji: "🍓", keywords: ["딸기", "strawberry", "과일"], category: "과일" },
  { emoji: "🫐", keywords: ["블루베리", "blueberry", "과일"], category: "과일" },
  { emoji: "🍒", keywords: ["체리", "cherry", "과일"], category: "과일" },
  { emoji: "🍑", keywords: ["복숭아", "peach", "과일"], category: "과일" },
  { emoji: "🥭", keywords: ["망고", "mango", "과일"], category: "과일" },
  { emoji: "🍍", keywords: ["파인애플", "pineapple", "과일"], category: "과일" },
  { emoji: "🥥", keywords: ["코코넛", "coconut", "과일"], category: "과일" },
  { emoji: "🍌", keywords: ["바나나", "banana", "과일"], category: "과일" },
  { emoji: "🍉", keywords: ["수박", "watermelon", "과일"], category: "과일" },
  { emoji: "🍈", keywords: ["메론", "멜론", "melon", "과일"], category: "과일" },
  { emoji: "🍐", keywords: ["배", "pear", "과일"], category: "과일" },
  { emoji: "🍏", keywords: ["초록사과", "그린애플", "과일", "green apple"], category: "과일" },
  { emoji: "🫒", keywords: ["올리브", "olive", "과일"], category: "과일" },
  { emoji: "🥝", keywords: ["키위", "kiwi", "과일"], category: "과일" },
  { emoji: "🍅", keywords: ["토마토", "tomato", "과일", "채소"], category: "과일" },
  { emoji: "🫙", keywords: ["잼", "딸기잼", "jam", "과일"], category: "과일" },

  // ── 음식 / 음료 ──
  { emoji: "☕", keywords: ["커피", "카페", "coffee"], category: "음식" },
  { emoji: "🍵", keywords: ["차", "녹차", "tea"], category: "음식" },
  { emoji: "🍕", keywords: ["피자", "pizza"], category: "음식" },
  { emoji: "🍔", keywords: ["햄버거", "burger"], category: "음식" },
  { emoji: "🍜", keywords: ["라면", "국수", "ramen", "noodle"], category: "음식" },
  { emoji: "🍱", keywords: ["도시락", "음식", "bento"], category: "음식" },
  { emoji: "🥗", keywords: ["샐러드", "다이어트", "야채", "salad"], category: "음식" },
  { emoji: "🍰", keywords: ["케이크", "생일", "디저트", "cake"], category: "음식" },
  { emoji: "🍺", keywords: ["맥주", "술", "beer"], category: "음식" },

  // ── 자연 / 날씨 ──
  { emoji: "🌱", keywords: ["새싹", "성장", "식물", "시작", "plant"], category: "자연" },
  { emoji: "🌸", keywords: ["벚꽃", "꽃", "봄", "cherry"], category: "자연" },
  { emoji: "🌈", keywords: ["무지개", "rainbow", "색깔"], category: "자연" },
  { emoji: "☀️", keywords: ["태양", "맑음", "sun", "날씨"], category: "자연" },
  { emoji: "🌙", keywords: ["달", "밤", "moon"], category: "자연" },
  { emoji: "⚡", keywords: ["번개", "빠름", "전기", "lightning"], category: "자연" },
  { emoji: "🔥", keywords: ["불꽃", "화염", "열정", "fire", "hot"], category: "자연" },
  { emoji: "❄️", keywords: ["눈", "겨울", "차가움", "snow"], category: "자연" },
  { emoji: "🌊", keywords: ["파도", "바다", "물", "wave"], category: "자연" },
  { emoji: "🏔️", keywords: ["산", "등산", "mountain"], category: "자연" },

  // ── 여행 / 장소 ──
  { emoji: "✈️", keywords: ["비행기", "여행", "출장", "plane"], category: "여행" },
  { emoji: "🌏", keywords: ["지구", "세계", "글로벌", "earth"], category: "여행" },
  { emoji: "🗺️", keywords: ["지도", "여행", "map"], category: "여행" },
  { emoji: "🏖️", keywords: ["바다", "해변", "휴가", "beach"], category: "여행" },
  { emoji: "🏕️", keywords: ["캠핑", "야외", "camping"], category: "여행" },
  { emoji: "🗼", keywords: ["에펠탑", "파리", "여행"], category: "여행" },
  { emoji: "🚆", keywords: ["기차", "여행", "train"], category: "여행" },
  { emoji: "🚗", keywords: ["자동차", "드라이브", "car"], category: "여행" },

  // ── 동물 ──
  { emoji: "🐶", keywords: ["강아지", "개", "dog", "puppy", "동물"], category: "동물" },
  { emoji: "🐱", keywords: ["고양이", "냥이", "cat", "kitten", "동물"], category: "동물" },
  { emoji: "🐻", keywords: ["곰", "bear", "동물"], category: "동물" },
  { emoji: "🐼", keywords: ["판다", "panda", "동물"], category: "동물" },
  { emoji: "🐨", keywords: ["코알라", "koala", "동물"], category: "동물" },
  { emoji: "🐯", keywords: ["호랑이", "tiger", "동물"], category: "동물" },
  { emoji: "🦁", keywords: ["사자", "lion", "동물"], category: "동물" },
  { emoji: "🐮", keywords: ["소", "젖소", "cow", "동물"], category: "동물" },
  { emoji: "🐷", keywords: ["돼지", "pig", "동물"], category: "동물" },
  { emoji: "🐸", keywords: ["개구리", "frog", "동물"], category: "동물" },
  { emoji: "🐵", keywords: ["원숭이", "monkey", "동물"], category: "동물" },
  { emoji: "🐔", keywords: ["닭", "chicken", "동물"], category: "동물" },
  { emoji: "🐧", keywords: ["펭귄", "penguin", "동물"], category: "동물" },
  { emoji: "🐦", keywords: ["새", "bird", "동물"], category: "동물" },
  { emoji: "🦆", keywords: ["오리", "duck", "동물"], category: "동물" },
  { emoji: "🦅", keywords: ["독수리", "eagle", "동물"], category: "동물" },
  { emoji: "🦉", keywords: ["부엉이", "올빼미", "owl", "동물"], category: "동물" },
  { emoji: "🦊", keywords: ["여우", "fox", "동물"], category: "동물" },
  { emoji: "🐺", keywords: ["늑대", "wolf", "동물"], category: "동물" },
  { emoji: "🐗", keywords: ["멧돼지", "boar", "동물"], category: "동물" },
  { emoji: "🐴", keywords: ["말", "horse", "동물"], category: "동물" },
  { emoji: "🦄", keywords: ["유니콘", "unicorn", "동물"], category: "동물" },
  { emoji: "🐝", keywords: ["벌", "꿀벌", "bee", "동물"], category: "동물" },
  { emoji: "🦋", keywords: ["나비", "butterfly", "동물"], category: "동물" },
  { emoji: "🐢", keywords: ["거북이", "turtle", "동물"], category: "동물" },
  { emoji: "🐍", keywords: ["뱀", "snake", "동물"], category: "동물" },
  { emoji: "🦎", keywords: ["도마뱀", "lizard", "동물"], category: "동물" },
  { emoji: "🐬", keywords: ["돌고래", "dolphin", "동물"], category: "동물" },
  { emoji: "🐳", keywords: ["고래", "whale", "동물"], category: "동물" },
  { emoji: "🦈", keywords: ["상어", "shark", "동물"], category: "동물" },
  { emoji: "🐙", keywords: ["문어", "octopus", "동물"], category: "동물" },
  { emoji: "🦓", keywords: ["얼룩말", "zebra", "동물"], category: "동물" },
  { emoji: "🦒", keywords: ["기린", "giraffe", "동물"], category: "동물" },
  { emoji: "🐘", keywords: ["코끼리", "elephant", "동물"], category: "동물" },
  { emoji: "🦏", keywords: ["코뿔소", "rhinoceros", "동물"], category: "동물" },
  { emoji: "🦛", keywords: ["하마", "hippo", "동물"], category: "동물" },
  { emoji: "🐿️", keywords: ["다람쥐", "squirrel", "동물"], category: "동물" },
  { emoji: "🦔", keywords: ["고슴도치", "hedgehog", "동물"], category: "동물" },
  { emoji: "🐇", keywords: ["토끼", "rabbit", "동물"], category: "동물" },
  { emoji: "🦘", keywords: ["캥거루", "kangaroo", "동물"], category: "동물" },

  // ── 감정 / 표현 ──
  { emoji: "😊", keywords: ["웃음", "행복", "기쁨", "미소", "smile"], category: "감정" },
  { emoji: "🥰", keywords: ["사랑", "좋아함", "귀여움", "love"], category: "감정" },
  { emoji: "😂", keywords: ["웃김", "재미", "laugh"], category: "감정" },
  { emoji: "🤔", keywords: ["생각", "고민", "think"], category: "감정" },
  { emoji: "😤", keywords: ["열정", "파이팅", "fighting"], category: "감정" },
  { emoji: "🙌", keywords: ["박수", "칭찬", "응원", "cheer"], category: "감정" },
  { emoji: "🎉", keywords: ["파티", "축하", "이벤트", "party", "celebrate"], category: "감정" },
  { emoji: "❤️", keywords: ["하트", "사랑", "heart", "love"], category: "감정" },
  { emoji: "💪", keywords: ["화이팅", "파이팅", "응원", "fighting"], category: "감정" },
];

export const EMOJI_CATEGORIES = ["전체", "동물", "과일", "공부", "운동", "개발", "목표", "팀", "예술", "음식", "자연", "여행", "감정"];

export function searchEmoji(query: string): EmojiEntry[] {
  if (!query.trim()) return EMOJI_KO_DATA;
  const q = query.toLowerCase().trim();
  return EMOJI_KO_DATA.filter((entry) =>
    entry.keywords.some((kw) => kw.includes(q)) || entry.emoji.includes(q)
  );
}
