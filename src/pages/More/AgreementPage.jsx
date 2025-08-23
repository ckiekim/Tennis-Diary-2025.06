import { Box, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import GavelIcon from '@mui/icons-material/Gavel';

const AgreementPage = () => {
  return (
    <MainLayout title='테니스 다이어리'>
      <Box sx={{ p: 2, pb: 4 }}> {/* 하단 여백 추가 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GavelIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Tennis Diary 서비스 이용약관
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제1조 (목적)</Typography>
          <Typography variant="body2" color="text.secondary">
            이 약관은 CK World(이하 "회사")가 제공하는 Tennis Diary 애플리케이션(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제2조 (용어의 정의)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. "서비스"라 함은 회사가 제공하는 Tennis Diary 애플리케이션 및 관련 제반 서비스를 의미합니다. <br />
            2. "회원"이라 함은 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다. <br />
            3. "마일리지" 또는 "포인트"라 함은 회원이 서비스 내에서 특정 활동을 수행할 경우 회사가 정한 정책에 따라 부여하는 서비스 상의 점수를 의미하며, 화폐적 가치는 없습니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제3조 (약관의 게시와 개정)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 내 초기화면 또는 연결화면을 통해 게시합니다. <br />
            2. 회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다. <br />
            3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 그 적용일자 7일 전부터 공지합니다. 단, 회원에게 불리한 약관 개정의 경우에는 30일 이상의 유예기간을 두고 공지합니다. <br />
            4. 회원이 개정약관에 동의하지 않는 경우 회원은 회원 탈퇴를 할 수 있습니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제4조 (이용계약 체결)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 이용계약은 서비스를 이용하고자 하는 자가 본 약관의 내용에 동의한 후, 회사가 정한 절차에 따라 가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다. <br />
            2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다. <br />
            - 허위의 정보를 기재하거나, 타인의 명의를 이용한 경우 <br />
            - 법령에 위배되거나 사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우 <br />
            - 기타 회사가 정한 이용신청 요건이 미비되었을 경우
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제5조 (마일리지 서비스)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회사는 서비스 운영 정책에 따라 회원에게 마일리지를 부여할 수 있습니다. <br />
            2. 마일리지의 적립 기준은 다음과 같으며, 해당 기준은 회사의 정책에 따라 변경될 수 있습니다. <br />
            - 프로필 설정 완료 시: 100 포인트 <br />
            - 일정 등록 시: 5 포인트 <br />
            - 경기 결과 등록 시: 5 포인트 <br />
            - 테니스 용품 등록 시: 10 포인트 <br />
            3. 회원은 서비스 내 지정된 페이지(우측 상단 이미지 클릭 등)를 통해 본인의 마일리지 보유 현황을 확인할 수 있습니다. <br />
            4. 회원이 마일리지 적립의 원인이 된 활동(일정, 용품 등록 등)을 취소 또는 삭제하는 경우, 해당 활동으로 지급되었던 마일리지는 자동으로 차감(회수)됩니다. <br />
            5. 마일리지는 현금으로 전환될 수 없으며, 타인에게 양도할 수 없습니다. <br />
            6. 회원이 이용계약을 해지(회원 탈퇴)할 경우, 보유한 마일리지는 즉시 소멸되며 복구되지 않습니다. <br />
            7. 회사는 서비스의 효율적 운영을 위해 사전 공지 후 마일리지 제도의 일부 또는 전부를 조정하거나 종료할 수 있으며, 이 경우 마일리지의 소멸 조건 등에 대해 회원에게 사전에 공지합니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제6조 (회사의 의무)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회사는 관련 법과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다. <br />
            2. 회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보보호를 위한 보안 시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제7조 (회원의 의무)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회원은 다음 행위를 하여서는 안 됩니다. <br />
            - 부정한 방법을 통해 마일리지를 축적하거나 사용하는 행위 <br />
            - 타인의 정보를 도용하는 행위 <br />
            - 회사의 운영을 고의로 방해하는 행위 <br />
            - 기타 불법적이거나 부당한 행위 <br />
            2. 회원은 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 합니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제8조 (계약해지 및 이용제한)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회원은 언제든지 서비스 내 회원 탈퇴 기능을 통하여 이용계약 해지를 신청할 수 있으며, 회사는 이를 즉시 처리하여야 합니다. <br />
            2. 회원이 제7조의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 회사는 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제9조 (면책조항)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. <br />
            2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">제10조 (준거법 및 재판관할)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. 회사와 회원 간에 발생한 분쟁에 대하여는 대한민국법을 준거법으로 합니다. <br />
            2. 회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight="bold">부칙</Typography>
          <Typography variant="body2" color="text.secondary">
            이 약관은 2025년 8월 25일부터 시행됩니다.
          </Typography>
        </Box>

      </Box>
    </MainLayout>
  );
};

export default AgreementPage;