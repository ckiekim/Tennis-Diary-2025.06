import firebase_admin
from firebase_admin import credentials, firestore

# ----------------- 설정 ----------------- #
# 다운로드한 서비스 계정 키 파일 경로
CRED_PATH = './serviceAccountKey.json' 
# ---------------------------------------- #

def add_participant_uids_to_events():
    """
    Firestore 'events' 컬렉션의 모든 문서에 participantUids 필드를 추가합니다.
    participantUids는 event 생성자 uid와 event_results 서브컬렉션의 모든 uid를 포함합니다.
    """
    # Firebase Admin SDK 초기화
    try:
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase Admin SDK가 성공적으로 초기화되었습니다.")
    except Exception as e:
        print(f"🚨 SDK 초기화 실패: {e}")
        print("CRED_PATH가 정확한지, 파일이 존재하는지 확인하세요.")
        return

    # 일괄 처리를 위한 batch 객체 생성
    batch = db.batch()
    commit_count = 0
    total_processed_count = 0

    try:
        events_ref = db.collection('events')
        event_docs = events_ref.stream()

        print("\n🚀 'events' 문서 업데이트를 시작합니다...")

        for event_doc in event_docs:
            total_processed_count += 1
            print(f"📄 처리 중인 이벤트: {event_doc.id}")

            participant_uids = set() # 중복을 자동으로 처리하기 위해 set 사용

            # 1. 이벤트 생성자의 UID 추가
            event_data = event_doc.to_dict()
            creator_uid = event_data.get('uid')
            if creator_uid:
                participant_uids.add(creator_uid)

            # 2. 하위 컬렉션 'event_results'의 결과 입력자 UID 추가
            results_ref = event_doc.reference.collection('event_results')
            result_docs = results_ref.stream()
            
            result_uids = [result_doc.to_dict().get('uid') for result_doc in result_docs]
            for uid in result_uids:
                if uid:
                    participant_uids.add(uid)

            # 3. 최종 UID 리스트를 event 문서에 업데이트 (batch에 추가)
            final_uids_list = list(participant_uids)
            batch.update(event_doc.reference, {'participantUids': final_uids_list})
            
            print(f"  -> 참여자: {final_uids_list}")
            
            commit_count += 1

            # Firestore는 batch 당 최대 500개의 작업을 허용합니다.
            # 안전하게 400개마다 커밋합니다.
            if commit_count >= 400:
                print(f"\n✨ {commit_count}개의 작업을 커밋합니다...")
                batch.commit()
                print("  -> 커밋 완료.")
                # 새 batch 객체를 생성합니다.
                batch = db.batch()
                commit_count = 0

        # 루프 종료 후 남은 작업이 있다면 커밋
        if commit_count > 0:
            print(f"\n✨ 남은 {commit_count}개의 작업을 커밋합니다...")
            batch.commit()
            print("  -> 커밋 완료.")

        print(f"\n🎉 총 {total_processed_count}개의 이벤트 문서 처리가 완료되었습니다.")

    except Exception as e:
        print(f"🚨 스크립트 실행 중 오류 발생: {e}")

# 스크립트 실행
if __name__ == '__main__':
    add_participant_uids_to_events()