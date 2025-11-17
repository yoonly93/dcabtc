let currentBtcPrice = null;
let isFallback = false;

// 페이지 로드 시 한 번만 가격 fetch
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    const data = await res.json();
    currentBtcPrice = parseFloat(data[0].trade_price);
  } catch (err) {
    console.warn('실시간 가격 가져오기 실패:', err);
    currentBtcPrice = 141000000; // fallbackPrice 예시값
    isFallback = true;
  }

  document.getElementById('calculateBtn')
          .addEventListener('click', calculateBTC);
});

async function calculateBTC() {
  const targetBtc = parseFloat(document.getElementById('targetBtc').value);
  const monthlyInvestment = parseInt(document.getElementById('monthlyInvestment').value);
  const monthlyRate = parseFloat(document.getElementById('monthlyRate').value) / 100;

  if (!targetBtc || !monthlyInvestment || monthlyInvestment <= 0) {
    return alert('모든 값을 입력해주세요.');
  }

  let price = currentBtcPrice;
  if (!price) return alert('BTC 가격을 가져오지 못했습니다.');

  let month = 0;
  let accumulatedBtc = 0;
  let monthlyTableHtml = '';

  while (accumulatedBtc < targetBtc) {
    month++;
    const btcBought = monthlyInvestment / price;
    accumulatedBtc += btcBought;

    monthlyTableHtml += `<tr>
      <td class="border px-2 py-1">${month}개월차</td>
      <td class="border px-2 py-1">${price.toLocaleString()}원</td>
      <td class="border px-2 py-1">${btcBought.toFixed(6)}</td>
      <td class="border px-2 py-1">${accumulatedBtc.toFixed(6)}</td>
    </tr>`;

    price *= (1 + monthlyRate);
  }

  document.getElementById('requiredMonths').textContent = month;
  document.getElementById('totalInvestment').textContent = formatInvestmentDisplay(month * monthlyInvestment);
  document.getElementById('monthlyTable').innerHTML = monthlyTableHtml;
  document.getElementById('resultCard').style.display = 'flex';

  // fallback 주의문구 표시
  document.getElementById('fallbackNotice').textContent = isFallback
    ? '현재 비트코인 가격을 실시간으로 가져올 수 없어, 가장 최근에 확인된 가격으로 계산하고 있습니다. 실제 가격과 다를 수 있습니다.'
    : '';
}
