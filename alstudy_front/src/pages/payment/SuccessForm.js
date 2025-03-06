import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FetchAuthorizedPage from '../../service/FetchAuthorizedPage';

export function SuccessForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    async function confirm() {
      const requestData = {
        orderId: searchParams.get('orderId'),
        amount: searchParams.get('amount'),
        paymentKey: searchParams.get('paymentKey'),
        userGroupId: searchParams.get('userGroupId'),
      };

      if (
        !requestData.orderId ||
        !requestData.amount ||
        !requestData.paymentKey ||
        !requestData.userGroupId
      ) {
        navigate(`/fail?code=ERROR&message=필수 파라미터가 누락되었습니다.`);
        return;
      }

      try {
        const response = await FetchAuthorizedPage(
          '/api/payment/confirm',
          navigate,
          {
            pathname: window.location.pathname,
          },
          'POST',
          requestData
        );

        // 응답 처리
        if (response && response.isSuccess) {
          setResponseData(response);
        } else {
          // 실패 처리
          navigate(
            `/payment/fail?code=${response.code}&message=${response.message}`
          );
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        navigate(
          `/payment/fail?code=ERROR&message=결제 확인 중 오류가 발생했습니다.`
        );
      }
    }

    confirm();
  }, [navigate]);

  // 성공 화면 렌더링
  if (!responseData) {
    return null; // 로딩 중 또는 실패 시 화면을 보여주지 않음
  }

  return (
    <>
      <div className="box_section" style={{ width: '600px' }}>
        <img
          width="100px"
          src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
          alt="결제 성공 이미지"
        />
        <h2>결제를 완료했어요</h2>
        <div className="p-grid typography--p" style={{ marginTop: '50px' }}>
          <div className="p-grid-col text--left">
            <b>결제금액</b>
          </div>
          <div className="p-grid-col text--right" id="amount">
            {`${Number(searchParams.get('amount')).toLocaleString()}원`}
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
          <div className="p-grid-col text--left">
            <b>주문번호</b>
          </div>
          <div className="p-grid-col text--right" id="orderId">
            {`${searchParams.get('orderId')}`}
          </div>
        </div>
        <div className="p-grid typography--p" style={{ marginTop: '10px' }}>
          <div className="p-grid-col text--left">
            <b>paymentKey</b>
          </div>
          <div
            className="p-grid-col text--right"
            id="paymentKey"
            style={{ whiteSpace: 'initial', width: '250px' }}
          >
            {`${searchParams.get('paymentKey')}`}
          </div>
        </div>
        <button
          style={{
            marginTop: '30px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
          onClick={() => {
            navigate(`/usergroups`); // navigate 함수를 사용하여 유저 그룹 페이지로 이동
          }}
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    </>
  );
}
