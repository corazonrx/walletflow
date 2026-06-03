const $ = (id) => document.getElementById(id);

const welcomeTitle = $("welcomeTitle");
const logoutButton = $("logoutButton");
const transactionForm = $("transactionForm");
const transactionMessage = $("transactionMessage");
const transactionList = $("transactionList");
const incomeTotal = $("incomeTotal");
const expenseTotal = $("expenseTotal");
const balanceTotal = $("balanceTotal");
const transactionCount = $("transactionCount");
const currencySelect = $("currencySelect");
const convertedBalance = $("convertedBalance");

let transactions = [];

function getToken() {
  return localStorage.getItem("walletflow_token");
}

function getUser() {
  const user = localStorage.getItem("walletflow_user");
  return user ? JSON.parse(user) : null;
}

function clearSession() {
  localStorage.removeItem("walletflow_token");
  localStorage.removeItem("walletflow_user");
}

function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function checkAuth() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "index.html";
    return;
  }

  welcomeTitle.textContent = `Welcome, ${user.name}`;
}

async function loadTransactions() {
  try {
    const response = await fetch("/api/transactions", {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Could not load transactions");
    }

    transactions = await response.json();
    renderDashboard();
  } catch (error) {
    transactionList.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

transactionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    type: $("transactionType").value,
    amount: $("transactionAmount").value,
    category: $("transactionCategory").value,
    date: $("transactionDate").value,
    note: $("transactionNote").value
  };

  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not add transaction");
    }

    transactionMessage.textContent = "Transaction added";
    transactionForm.reset();
    loadTransactions();
  } catch (error) {
    transactionMessage.textContent = error.message;
  }
});

async function deleteTransaction(id) {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error("Could not delete transaction");
    }

    loadTransactions();
  } catch (error) {
    transactionMessage.textContent = error.message;
  }
}

function renderDashboard() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;

  incomeTotal.textContent = formatMoney(income);
  expenseTotal.textContent = formatMoney(expenses);
  balanceTotal.textContent = formatMoney(balance);
  transactionCount.textContent = transactions.length;

  renderTransactions();
  updateConvertedBalance();
}

function renderTransactions() {
  if (transactions.length === 0) {
    transactionList.innerHTML = `<p class="empty-state">No transactions yet</p>`;
    return;
  }

  transactionList.innerHTML = transactions
    .map((item) => {
      const amountClass = item.type === "income" ? "amount-income" : "amount-expense";
      const sign = item.type === "income" ? "+" : "-";

      return `
        <div class="transaction-item">
          <div class="transaction-main">
            <strong>${item.category}</strong>
            <span>${item.date} ${item.note ? "- " + item.note : ""}</span>
          </div>
          <div class="${amountClass}">${sign}${formatMoney(item.amount)}</div>
          <button class="delete-button" onclick="deleteTransaction(${item.id})">x</button>
        </div>
      `;
    })
    .join("");
}


// function renderMedian() {
//   const expenses = transactions.filter((item) => item.type === "expense");
//   const amounts = expenses.map((item) => item.amount).sort((a, b) => a - b);
//   const middle = Math.floor(amounts.length / 2);
// }

async function updateConvertedBalance() {
  const selectedCurrency = currencySelect.value;

  if (!selectedCurrency) {
    convertedBalance.textContent = "-";
    return;
  }

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    const rate = data.rates[selectedCurrency];

    if (!response.ok || !rate) {
      throw new Error("Currency API error");
    }

    convertedBalance.textContent = `${selectedCurrency} ${(balance * rate).toFixed(2)}`;
  } catch (error) {
    convertedBalance.textContent = "API error";
  }
}

currencySelect.addEventListener("change", () => {
  updateConvertedBalance();
});

logoutButton.addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

checkAuth();
loadTransactions();