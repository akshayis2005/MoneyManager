
function register() {
  const user = document.getElementById("name").value;
  const mail = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  // console.log("name",user,mail,pass);

  if (mail == "" || user == "" || pass == "") {
    alert("All values Required");
  } else {
    if (email in localStorage) {
      alert("User email already exist");
    } else {
      const userObj = {
        user,
        mail,
        pass,
      };
      localStorage.setItem(user, JSON.stringify(userObj));
      alert("User Registered successfully");
      window.location = "./main.html";
    }
  }
}

// -------login-------

function login() {
  const user = document.getElementById("uname").value;
  const password = document.getElementById("pswd").value;
  if (user == "" || password == "") {
    alert("All value Required");
  } else {
    if (user in localStorage) {
      let newUserObj = JSON.parse(localStorage.getItem(user));
      //    console.log(newUserObj);
      if (password == newUserObj.pass) {
        localStorage.setItem("successObj", JSON.stringify(newUserObj));
        localStorage.setItem("successkey", user);
        // alert("Login successfully");
        window.location = "./main.html";
      } else {
        alert("wrong password");
      }
    } else {
      alert("User not found");
    }
  }
}



const STORAGE_KEY = "expenceTrackerTransactions";

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
});

let transactions = loadTransactions();

function loadTransactions() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function todayISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}

function addTransaction(type, description, category, amount, date) {
    transactions.push({
        id: Date.now() + Math.random().toString(16).slice(2),
        type,
        description: description.trim(),
        category,
        amount: Number(amount),
        date,
    });
    saveTransactions();
    render();
}

function deleteTransaction(id) {
    transactions = transactions.filter((item) => item.id !== id);
    saveTransactions();
    render();
}

function calculateTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }
    });

    return { income, expense, balance: income - expense };
}

function renderSummary() {
    const { income, expense, balance } = calculateTotals();

    document.getElementById("totalIncome").textContent = currency.format(income);
    document.getElementById("totalExpense").textContent = currency.format(expense);

    const balanceEl = document.getElementById("balance");
    balanceEl.textContent = currency.format(balance);
    balanceEl.className = balance < 0 ? "text-warning" : "";
}

function renderTransactions() {
    const body = document.getElementById("transactionBody");
    const count = document.getElementById("transactionCount");
    count.textContent = transactions.length;

    if (transactions.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No transactions yet. Add your first income or expense above.</td></tr>`;
        return;
    }

    const sorted = [...transactions].sort((a, b) => {
        if (a.date === b.date) return b.id.localeCompare(a.id);
        return b.date.localeCompare(a.date);
    });

    body.innerHTML = sorted
        .map((item) => {
            const isIncome = item.type === "income";
            const badge = isIncome
                ? '<span class="badge bg-success">Income</span>'
                : '<span class="badge bg-danger">Expense</span>';
            const amountClass = isIncome ? "amount-income" : "amount-expense";
            const sign = isIncome ? "+" : "-";

            return `
                <tr>
                    <td>${new Date(item.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>${escapeHtml(item.description)}</td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${badge}</td>
                    <td class="text-end ${amountClass}">${sign}${currency.format(item.amount)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" data-delete="${item.id}">Delete</button>
                    </td>
                </tr>`;
        })
        .join("");
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function render() {
    renderSummary();
    renderTransactions();
}

document.getElementById("incomeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addTransaction(
        "income",
        document.getElementById("incomeDescription").value,
        document.getElementById("incomeCategory").value,
        document.getElementById("incomeAmount").value,
        document.getElementById("incomeDate").value
    );
    event.target.reset();
    document.getElementById("incomeDate").value = todayISO();
});

document.getElementById("expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addTransaction(
        "expense",
        document.getElementById("expenseDescription").value,
        document.getElementById("expenseCategory").value,
        document.getElementById("expenseAmount").value,
        document.getElementById("expenseDate").value
    );
    event.target.reset();
    document.getElementById("expenseDate").value = todayISO();
});

document.getElementById("transactionBody").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    if (confirm("Delete this transaction?")) {
        deleteTransaction(button.dataset.delete);
    }
});

document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (transactions.length === 0) return;
    if (confirm("Delete all transactions? This cannot be undone.")) {
        transactions = [];
        saveTransactions();
        render();
    }
});

document.getElementById("incomeDate").value = todayISO();
document.getElementById("expenseDate").value = todayISO();

render();
