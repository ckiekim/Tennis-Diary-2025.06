import firebase_admin
from firebase_admin import credentials, firestore

# --- 설정 (사용자 수정 필요) ---

# 1. 다운로드한 서비스 계정 키 파일 경로를 입력하세요.
SERVICE_ACCOUNT_KEY_PATH = "./serviceAccountKey.json"

# 2. Firebase 프로젝트 ID를 입력하세요.
FIREBASE_PROJECT_ID = "tennis-diary-517c4"

# 3. 원본 컬렉션 및 생성할 서브컬렉션 이름
SOURCE_COLLECTION = "events"
SUB_COLLECTION_NAME = "event_results"

# --- 스크립트 시작 ---

def migrate_selective_data():
    """
    Firestore 'events' 컬렉션의 특정 필드를 'event_results' 서브컬렉션으로
    선별적으로 이동 및 복사합니다.
    """
    try:
        # Firebase Admin SDK 초기화
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred, {
            'projectId': FIREBASE_PROJECT_ID,
        })
        db = firestore.client()
        print("✅ Firebase Admin SDK가 성공적으로 초기화되었습니다.")
    except Exception as e:
        print(f"❌ Firebase 초기화 실패: {e}")
        print("서비스 계정 키 경로와 프로젝트 ID를 확인하세요.")
        return

    # 소스 컬렉션 참조
    source_collection_ref = db.collection(SOURCE_COLLECTION)
    
    print(f"\n🚀 '{SOURCE_COLLECTION}' 컬렉션의 데이터 마이그레이션을 시작합니다...")

    # 이동할 필드와 복사할 필드를 정의합니다.
    fields_to_move = ['memo', 'photoList', 'result']
    fields_to_copy = ['uid', 'clubId'] # clubId는 선택적으로 복사됩니다.

    try:
        docs = source_collection_ref.stream()
        processed_count = 0

        for doc in docs:
            doc_data = doc.to_dict()
            doc_id = doc.id
            
            if not doc_data:
                print(f"📄 문서 '{doc_id}'는 데이터가 없어 건너뜁니다.")
                continue

            print(f"⏳ 처리 중: 문서 ID '{doc_id}'")

            # 1. 서브컬렉션에 저장할 새로운 데이터 객체 생성
            new_result_data = {
                'eventId': doc_id,  # events 컬렉션의 문서 ID 저장
                'createdAt': firestore.SERVER_TIMESTAMP, # 서버 타임스탬프
            }

            # 2. 필드 복사 (uid, clubId)
            for field in fields_to_copy:
                if field in doc_data:
                    new_result_data[field] = doc_data[field]
                    print(f"  -> 필드 복사: '{field}'")

            # 3. 필드 이동 (memo, photoList, result) 및 원본에서 삭제할 필드 준비
            fields_to_delete = {}
            moved_field_exists = False
            for field in fields_to_move:
                if field in doc_data:
                    new_result_data[field] = doc_data[field]
                    fields_to_delete[field] = firestore.DELETE_FIELD
                    moved_field_exists = True
                    print(f"  -> 필드 이동: '{field}'")

            # 4. 이동할 필드가 하나라도 있을 경우에만 Firestore 작업 수행
            if moved_field_exists:
                # 4-1. event_results 서브컬렉션에 새 문서 추가 (자동 생성 ID 사용)
                sub_collection_ref = source_collection_ref.document(doc_id).collection(SUB_COLLECTION_NAME)
                update_time, new_doc_ref = sub_collection_ref.add(new_result_data)
                print(f"  ✅ '{SUB_COLLECTION_NAME}' 서브컬렉션에 새 문서('{new_doc_ref.id}') 생성 완료.")

                # 4-2. 원본 문서에서 이동한 필드들 삭제
                doc.reference.update(fields_to_delete)
                print(f"  ✅ 원본 문서 '{doc_id}'에서 이동된 필드 삭제 완료.")
                
                processed_count += 1
            else:
                print(f"  -> 이동할 필드(memo, photoList, result)가 없어 건너뜁니다.")

        if processed_count == 0:
            print("\n✅ 마이그레이션 완료. 처리할 문서가 없거나 이동할 필드를 가진 문서가 없습니다.")
        else:
            print(f"\n🎉 마이그레이션 성공! 총 {processed_count}개의 문서가 처리되었습니다.")

    except Exception as e:
        print(f"\n❌ 마이그레이션 중 오류 발생: {e}")

if __name__ == "__main__":
    migrate_selective_data()