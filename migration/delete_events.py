# 파일 이름: delete_events.py
import firebase_admin
from firebase_admin import credentials, firestore

# --- 설정 (경로만 수정해주세요) ---
SERVICE_ACCOUNT_KEY_PATH = "./serviceAccountKey.json"
FIREBASE_PROJECT_ID = "tennis-diary-517c4"
COLLECTION_TO_DELETE = "events"
BATCH_SIZE = 50 

# --- 스크립트 시작 ---
def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f'Deleting doc {doc.id} ...')
        # 하위 컬렉션 재귀적으로 삭제
        for sub_coll_ref in doc.reference.collections():
            print(f'  -> Found subcollection {sub_coll_ref.id}, deleting its documents...')
            delete_collection(sub_coll_ref, batch_size)
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

def main():
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT_ID})
        db = firestore.client()
        print("✅ Firebase Admin SDK 초기화 완료.")
    except Exception as e:
        print(f"❌ Firebase 초기화 실패: {e}")
        return

    print(f"\n🚀 '{COLLECTION_TO_DELETE}' 컬렉션과 모든 하위 컬렉션 삭제를 시작합니다...")
    coll_ref = db.collection(COLLECTION_TO_DELETE)
    delete_collection(coll_ref, BATCH_SIZE)
    print("\n🎉 컬렉션 삭제가 완료되었습니다.")

if __name__ == '__main__':
    main()