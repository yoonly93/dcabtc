feather.replace();

let currentBtcPrice = null;
let isFallback = false;

document.addEventListener('DOMContentLoaded', async () => {
  // 페이지 로드 시 서버리스 API 호출
  try {
    const res = await fetch('/api/btc-price');
    const data = await res.json();
    currentBtcPrice = parseFloat(data[0].trade_price);
  } catch (err) {
    console.warn('실시간 가격 가져오기 실패:', err);
    currentBtcPrice = 141000000; // fallbackPrice 예시
    isFallback = true;
  }

  document.getElementById('calculateBtn')
          .addEventListener('click', calculateBTC);

  const investmentInput = document.getElementById('monthlyInvestment');
  investmentInput.addEventListener('input', updateInvestmentDisplay);

  updateInvestmentDisplay();
});

// 금액 포맷
function formatWon(value) {
  return value.toLocaleString() + '원';
}

function formatInvestmentDisplay(value) {
  if (!value || value <= 0) return '0원';
  if (value >= 10000) return Math.round(value / 10000).toLocaleString() + '만원';
  return value.toLocaleString() + '원';
}

function updateInvestmentDisplay() {
  const input = document.getElementById('monthlyInvestment');
  const value = parseInt(input.value) || 0;
  document.getElementById('investmentDisplay').textContent = formatInvestmentDisplay(value);
  toggleClearIcon();
}

function toggleClearIcon() {
  const input = document.getElementById('monthlyInvestment');
  const btn = document.getElementById('clearBtn');
  btn.style.display = input.value ? 'block' : 'none';
}

function clearInvestment() {
  const input = document.getElementById('monthlyInvestment');
  input.value = '';
  updateInvestmentDisplay();
}

function addInvestment(amount) {
  const input = document.getElementById('monthlyInvestment');
  let current = parseInt(input.value) || 0;
  current += amount;
  input.value = current;
  updateInvestmentDisplay();
}

async function calculateBTC() {
  const targetBtc = parseFloat(document.getElementById('targetBtc').value);
  const monthlyInvestment = parseInt(document.getElementById('monthlyInvestment').value);
  const monthlyRate = parseFloat(document.getElementById('monthlyRate').value) / 100;

  if (!targetBtc || !monthlyInvestment || monthlyInvestment <= 0) {
    return alert('모든 값을 입력해주세요.');
  }

  let price = currentBtcPrice;
  if (!price) return alert('BTC 가격을 가져오지 못했습니다.');

  const MAX_MONTHS = 1200;
  let month = 0;
  let accumulatedBtc = 0;

  const tbody = document.getElementById('monthlyTable');
  tbody.innerHTML = '';

  while (accumulatedBtc < targetBtc && month < MAX_MONTHS) {
    month++;
    const btcBought = monthlyInvestment / price;
    accumulatedBtc += btcBought;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-2 py-1">${month}개월차</td>
      <td class="border px-2 py-1">${formatWon(Math.round(price))}</td>
      <td class="border px-2 py-1">${btcBought.toFixed(6)}</td>
      <td class="border px-2 py-1">${accumulatedBtc.toFixed(6)}</td>
    `;
    tbody.appendChild(tr);

    price *= (1 + monthlyRate);
  }

  if (month >= MAX_MONTHS) {
    alert("투입금액이 너무 적어 목표 BTC까지 도달하는 데 너무 많은 기간이 필요합니다.");
  }

  document.getElementById('requiredMonths').textContent = month;
  document.getElementById('totalInvestment').textContent = formatInvestmentDisplay(month * monthlyInvestment);
  document.getElementById('resultCard').style.display = 'flex';

  document.getElementById('fallbackNotice').textContent = isFallback
    ? '현재 비트코인 가격을 실시간으로 가져올 수 없어, 가장 최근에 확인된 가격으로 계산하고 있습니다. 실제 가격과 다를 수 있습니다.'
    : '';
}
