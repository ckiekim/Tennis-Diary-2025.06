import firebase_admin
from firebase_admin import credentials, firestore
import re

# --- 기본 설정 ---
# 서비스 계정 키 파일 경로
CRED_PATH = './serviceAccountKey.json'
# Firebase 프로젝트 ID
PROJECT_ID = 'tennis-diary-517c4'
# -----------------

# Firebase Admin SDK 초기화
cred = credentials.Certificate(CRED_PATH)
firebase_admin.initialize_app(cred, {'projectId': PROJECT_ID})
db = firestore.client()

def get_base_name(name):
    """코트 이름에서 '(실내)' 또는 '(실외)' 텍스트를 제거하고 기본 이름을 반환"""
    return re.sub(r'\s*\((실내|실외)\)\s*', '', name).strip()

def build_courts_lookup_map():
    """Firestore의 courts 컬렉션을 읽어 조회용 맵을 생성"""
    print('코트 정보를 메모리에 로드하는 중...')
    courts_map = {}
    courts_ref = db.collection('courts')
    for doc in courts_ref.stream():
        court_data = doc.to_dict()
        base_name = court_data.get('name')
        if not base_name:
            continue
        
        if base_name in courts_map:
            print(f"⚠️  경고: 이름이 중복된 코트가 있습니다 '{base_name}'. 마이그레이션 시 첫 번째 코트 정보를 사용합니다.")
        
        courts_map[base_name] = {'id': doc.id, **court_data}
    
    print(f'✅ {len(courts_map)}개의 코트 정보를 로드했습니다.')
    return courts_map

# 변경된 부분: 'async def'에서 'def'로 변경
def migrate_events():
    """events 컬렉션의 place 필드를 placeInfo 객체로 마이그레이션"""
    courts_map = build_courts_lookup_map()
    
    print('\nEvents 마이그레이션을 시작합니다...')
    events_ref = db.collection('events')
    batch = db.batch()
    update_count = 0
    processed_count = 0
    
    for event_doc in events_ref.stream():
        processed_count += 1
        event_data = event_doc.to_dict()
        
        if 'placeInfo' in event_data or 'place' not in event_data or not isinstance(event_data['place'], str):
            continue
            
        place_str = event_data['place']
        base_name = get_base_name(place_str)
        
        court_data = courts_map.get(base_name)
        if not court_data:
            print(f"❓ 경고: Event(id:{event_doc.id})의 장소 '{base_name}'에 해당하는 코트 정보를 찾을 수 없습니다. 건너뜁니다.")
            continue

        type_match = re.search(r'\((실내|실외)\)', place_str)
        parsed_type = type_match.group(1) if type_match else court_data.get('details', [{}])[0].get('type')

        if not parsed_type:
            print(f"❓ 경고: Event(id:{event_doc.id})의 장소 '{place_str}'에서 유효한 코트 타입을 찾을 수 없습니다. 건너뜁니다.")
            continue

        target_detail = next((d for d in court_data.get('details', []) if d.get('type') == parsed_type), None)
        if not target_detail:
            print(f"❓ 경고: Event(id:{event_doc.id})의 장소 '{place_str}'에 해당하는 코트 상세 정보({parsed_type})를 찾을 수 없습니다. 건너뜁니다.")
            continue
            
        place_info = {
            'courtId': court_data.get('id'),
            'courtName': court_data.get('name'),
            'courtType': parsed_type,
            'fullAddress': court_data.get('location', ''),
            'courtPhotoUrl': target_detail.get('photo', '')
        }
        
        batch.update(event_doc.reference, {
            'placeInfo': place_info,
            'place': firestore.DELETE_FIELD
        })
        update_count += 1

        if update_count > 0 and update_count % 500 == 0:
            print(f'{update_count}개의 문서를 커밋합니다...')
            # 변경된 부분: 'await' 제거
            batch.commit()
            batch = db.batch() 

    if update_count > 0 and update_count % 500 != 0:
        remaining_docs = update_count % 500
        print(f'남은 {remaining_docs}개의 문서를 커밋합니다...')
        # 변경된 부분: 'await' 제거
        batch.commit()
        print(f"\n✅ 총 {processed_count}개의 이벤트 중 {update_count}개 문서의 마이그레이션을 완료했습니다!")
    elif update_count == 0:
        print("\n마이그레이션할 이벤트가 없습니다.")
    else: # This handles the case where update_count is a multiple of 500
        print(f"\n✅ 총 {processed_count}개의 이벤트 중 {update_count}개 문서의 마이그레이션을 완료했습니다!")

# 변경된 부분: asyncio.run 제거하고 직접 함수 호출
if __name__ == '__main__':
    try:
        migrate_events()
    except Exception as e:
        print(f"\n❌ 마이그레이션 중 오류 발생: {e}")