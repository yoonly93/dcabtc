feather.replace();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculateBtn').addEventListener('click', calculateBTC);
});

// 업비트 KRW-BTC 현재가 가져오기
async function fetchBtcPrice() {
  try {
    const res = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
    const data = await res.json();
    // trade_price: 현재가
    return parseFloat(data[0].trade_price);
  } catch (err) {
    console.error('BTC 가격 가져오기 실패:', err);
    alert('BTC 가격을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    return null;
  }
}

// 금액 포맷
function formatWon(value) {
  return value.toLocaleString() + '원';
}

function formatInvestmentDisplay(value) {
  if (!value || value <= 0) return '0원';
  if (value >= 10000) return Math.round(value / 10000).toLocaleString() + '만원';
  return value.toLocaleString() + '원';
}

// 투입금액 클리어 아이콘 토글
function toggleClearIcon() {
  const input = document.getElementById('monthlyInvestment');
  const btn = document.getElementById('clearBtn');
  btn.style.display = input.value ? 'block' : 'none';
  document.getElementById('investmentDisplay').textContent = formatInvestmentDisplay(parseInt(input.value));
}

function clearInvestment() {
  const input = document.getElementById('monthlyInvestment');
  input.value = '';
  toggleClearIcon();
}

function addInvestment(amount) {
  const input = document.getElementById('monthlyInvestment');
  let current = parseInt(input.value) || 0;
  current += amount;
  input.value = current;
  toggleClearIcon();
}

// 계산 함수
async function calculateBTC() {
  const targetBtc = parseFloat(document.getElementById('targetBtc').value);
  const monthlyInvestment = parseInt(document.getElementById('monthlyInvestment').value);
  const monthlyRate = parseFloat(document.getElementById('monthlyRate').value) / 100;

  if (!targetBtc || !monthlyInvestment || monthlyInvestment <= 0) {
    return alert('모든 값을 입력해주세요.');
  }

  const startPrice = await fetchBtcPrice();
  if (!startPrice) return;

  let currentBtcPrice = startPrice;
  let month = 0;
  let accumulatedBtc = 0;
  let monthlyTableHtml = '';

  while (accumulatedBtc < targetBtc) {
    month++;
    const btcBought = monthlyInvestment / currentBtcPrice;
    accumulatedBtc += btcBought;

    monthlyTableHtml += `<tr>
      <td class="border px-2 py-1">${month}개월차</td>
      <td class="border px-2 py-1">${formatWon(Math.round(currentBtcPrice))}</td>
      <td class="border px-2 py-1">${btcBought.toFixed(6)}</td>
      <td class="border px-2 py-1">${accumulatedBtc.toFixed(6)}</td>
    </tr>`;

    currentBtcPrice *= (1 + monthlyRate);
  }

  document.getElementById('requiredMonths').textContent = month;
  document.getElementById('totalInvestment').textContent = formatInvestmentDisplay(month * monthlyInvestment);
  document.getElementById('monthlyTable').innerHTML = monthlyTableHtml;
  document.getElementById('resultCard').style.display = 'flex';
}
