import firebase_admin
from firebase_admin import credentials, firestore
import re # 정규표현식을 사용하기 위해 import

# 1. 서비스 계정 키 파일 경로
cred = credentials.Certificate('./serviceAccountKey.json')

# 2. Firebase Admin SDK 초기화
firebase_admin.initialize_app(cred, {
  'databaseURL': 'https://tennis-diary-517c4.firebaseio.com'
})

db = firestore.client()

def get_base_name(name):
    """코트 이름에서 '(실내)' 또는 '(실외)' 텍스트를 제거하고 기본 이름을 반환"""
    return re.sub(r'\s*\((실내|실외)\)\s*', '', name).strip()

def migrate_courts():
    """courts 컬렉션의 데이터를 마이그레이션하는 메인 함수"""
    print('코트 데이터 마이그레이션을 시작합니다...')

    courts_ref = db.collection('courts')
    docs_stream = courts_ref.stream()

    # 1. 기본 이름을 key로 하여 코트 문서를 그룹화
    courts_group = {}
    doc_count = 0
    for doc in docs_stream:
        doc_count += 1
        data = doc.to_dict()
        base_name = get_base_name(data.get('name', ''))
        
        if base_name not in courts_group:
            courts_group[base_name] = []
        
        doc_data_with_id = {'id': doc.id, **data}
        courts_group[base_name].append(doc_data_with_id)

    if doc_count == 0:
        print('마이그레이션할 데이터가 없습니다.')
        return

    print(f'{len(courts_group)}개의 그룹을 찾았습니다.')

    # 2. Firestore 일괄 쓰기(Batch) 생성
    batch = db.batch()
    migration_count = 0

    for base_name, docs in courts_group.items():
        # --- 변경된 부분 시작 ---
        # 이름 대신 'details' 필드의 존재 여부로 마이그레이션 완료를 판단
        if len(docs) == 1 and 'details' in docs[0]:
            continue
        # --- 변경된 부분 끝 ---
        
        migration_count += 1

        # 3. 실내 코트를 기준으로 ID와 기본 정보 설정
        indoor_court = next((d for d in docs if d.get('is_indoor')), None)
        outdoor_court = next((d for d in docs if not d.get('is_indoor')), None)

        representative_court = indoor_court or outdoor_court

        if not representative_court:
            print(f"⚠️  경고: '{base_name}' 그룹에 유효한 문서가 없어 건너뜁니다. 데이터를 확인해주세요.")
            continue

        target_id = representative_court['id']

        # 4. 새 통합 문서 데이터 생성
        new_court_data = {
            'name': base_name,
            'location': representative_court.get('location'),
            'details': []
        }

        # 5. details 배열 채우기
        for court in docs:
            new_court_data['details'].append({
                'type': '실내' if court.get('is_indoor') else '실외',
                'surface': court.get('surface', ''),
                'photo': court.get('photo', '')
            })

        # 6. 배치 작업 추가: 새 문서 생성 및 기존 문서 삭제
        new_doc_ref = courts_ref.document(target_id)
        batch.set(new_doc_ref, new_court_data)

        for court in docs:
            if court.get('id') != target_id:
                batch.delete(courts_ref.document(court.get('id')))

    if migration_count == 0:
        print('새롭게 마이그레이션할 코트가 없습니다.')
        return
        
    # 7. 배치 작업 실행
    batch.commit()
    print(f'✅ 성공적으로 {migration_count}개 그룹의 코트 정보를 추가/수정했습니다!')


if __name__ == '__main__':
    try:
        migrate_courts()
    except Exception as e:
        print(f'마이그레이션 중 오류 발생: {e}')