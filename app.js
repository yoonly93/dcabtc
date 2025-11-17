// ======== 설정값 ========
const MIN_INVESTMENT = 100_000;       // 최소 10만원
const MAX_INVESTMENT = 10_0000_0000;  // 최대 100억
const MAX_MONTHS = 1200;               // 최대 100년 반복
let currentBtcPrice = null;            // 실시간 가격만 사용

// 페이지 로드시 BTC 가격 fetch
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
        const data = await res.json();
        currentBtcPrice = data[0].trade_price;
    } catch (e) {
        console.error("실시간 가격 가져오기 실패:", e);
        alert("BTC 실시간 가격을 가져올 수 없어 계산을 진행할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
});

// ======== 투입금액 버튼 기능 ========
function addInvestment(amount) {
    const input = document.getElementById('monthlyInvestment');
    let val = Number(input.value || 0);
    val += amount;
    input.value = val;
    updateInvestmentDisplay();
    toggleClearIcon();
}

function clearInvestment() {
    const input = document.getElementById('monthlyInvestment');
    input.value = '';
    updateInvestmentDisplay();
    toggleClearIcon();
}

function toggleClearIcon() {
    const input = document.getElementById('monthlyInvestment');
    const btn = document.getElementById('clearBtn');
    btn.style.display = input.value ? 'block' : 'none';
}

function updateInvestmentDisplay() {
    const val = Number(document.getElementById('monthlyInvestment').value || 0);
    const display = document.getElementById('investmentDisplay');
    if (val >= 10_0000) {
        display.innerText = Math.round(val / 10_000) + '만 원';
    } else {
        display.innerText = val.toLocaleString() + '원';
    }
}

// ======== 계산 버튼 기능 ========
document.getElementById('calculateBtn').addEventListener('click', calculateBTC);

function calculateBTC() {
    if (!currentBtcPrice) {
        alert("BTC 실시간 가격이 없으면 계산할 수 없습니다.");
        return;
    }

    const monthlyInvestment = Number(document.getElementById('monthlyInvestment').value);
    const targetBtc = Number(document.getElementById('targetBtc').value);
    const monthlyRate = Number(document.getElementById('monthlyRate').value);

    // 입력 검증
    if (isNaN(monthlyInvestment) || monthlyInvestment < MIN_INVESTMENT || monthlyInvestment > MAX_INVESTMENT) {
        alert(`투입금액은 ${MIN_INVESTMENT.toLocaleString()}원 이상, ${MAX_INVESTMENT.toLocaleString()}원 이하로 입력해주세요.`);
        return;
    }
    if (isNaN(targetBtc) || targetBtc <= 0) {
        alert('목표 비트코인 개수를 올바르게 입력해주세요.');
        return;
    }
    if (isNaN(monthlyRate) || monthlyRate < 0) {
        alert('월별 상승률을 올바르게 입력해주세요.');
        return;
    }

    let accumulatedBtc = 0;
    let month = 0;
    let tableRows = '';

    while (accumulatedBtc < targetBtc) {
        month++;
        if (month > MAX_MONTHS) {
            alert("계산 기간이 너무 길어 목표 BTC에 도달할 수 없습니다.");
            break;
        }

        const priceThisMonth = currentBtcPrice * Math.pow(1 + monthlyRate / 100, month - 1);
        const purchaseBtc = monthlyInvestment / priceThisMonth;
        accumulatedBtc += purchaseBtc;

        tableRows += `<tr>
            <td class="border px-2 py-1">${month}개월차</td>
            <td class="border px-2 py-1">${Math.round(priceThisMonth).toLocaleString()}원</td>
            <td class="border px-2 py-1">${purchaseBtc.toFixed(6)}</td>
            <td class="border px-2 py-1">${accumulatedBtc.toFixed(6)}</td>
        </tr>`;
    }

    // 결과 표시
    document.getElementById('requiredMonths').innerText = month;
    document.getElementById('totalInvestment').innerText = (monthlyInvestment * month).toLocaleString() + '원';
    document.getElementById('monthlyTable').innerHTML = tableRows;
    document.getElementById('resultCard').classList.remove('hidden');
}
