feather.replace();

// 업비트 KRW-BTC 가격 가져오기
async function fetchBtcPrice() {
  const res = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
  const data = await res.json();
  return parseFloat(data[0].trade_price);
}

function formatWon(value) {
  return value.toLocaleString() + '원';
}

function formatInvestmentDisplay(value) {
  if (!value || value <= 0) return '0원';
  if (value >= 10000) return Math.round(value / 10000).toLocaleString() + '만원';
  return value.toLocaleString() + '원';
}

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

async function calculateBTC() {
  const targetBtc = parseFloat(document.getElementById('targetBtc').value);
  const monthlyInvestment = parseInt(document.getElementById('monthlyInvestment').value);
  const monthlyRate = parseFloat(document.getElementById('monthlyRate').value) / 100;

  if (!targetBtc || !monthlyInvestment || monthlyInvestment <= 0) {
    return alert('모든 값을 입력해주세요.');
  }

  const startPrice = await fetchBtcPrice();

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
