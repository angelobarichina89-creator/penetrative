const STORAGE_KEYS = {
    books: "libraryBooks",
    cart: "libraryCart",
    sales: "librarySales",
    borrows: "libraryBorrows",
    favorites: "libraryFavorites",
    recentlyViewed: "libraryRecent",
    notifications: "libraryNotifications",
    reports: "libraryReports",
    purchases: "libraryPurchases",
    userRatings: "libraryUserRatings"
};

const AUTH_ACCOUNTS_KEY = "libraryAccounts";

const defaultBooks = [
    { id: "BK-101", title: "Clean Codings", author: "Robert B. Stark", category: "Programming", price: 450, year: 2024, edition: "2nd", copies: 5, available: 3, shelf: "A-12", condition: "Good", description: "A handbook of agile software craftsmanship.", rating: 4.7, latest: "2024-10-05", image: "images/clean-codings.jpg", isPremium: false },
    { id: "BK-102", title: "The C Programming Language", author: "Xean M. Verutacio", category: "Programming", price: 300, year: 2013, edition: "1st", copies: 4, available: 2, shelf: "A-08", condition: "Fair", description: "Classic introduction to C.", rating: 4.5, latest: "2013-03-03", image: "images/the-c-programming-language.jpg", isPremium: false },
    { id: "BK-103", title: "Introduction to Java Programming", author: "Y. Daniel Liang", category: "Programming", price: 250, year: 2022, edition: "12th", copies: 6, available: 5, shelf: "A-15", condition: "Excellent", description: "Comprehensive Java textbook.", rating: 4.3, latest: "2026-10-17", image: "images/introduction-to-java-programming.jpg", isPremium: false },
    { id: "BK-104", title: "Python Crash Course", author: "Eric Banner", category: "Programming", price: 250, year: 2023, edition: "3rd", copies: 8, available: 6, shelf: "A-03", condition: "Good", description: "Hands-on Python projects.", rating: 4.8, latest: "2026-10-17", image: "images/python-crash-course.jpg", isPremium: false },
    { id: "BK-105", title: "Eloquent Web Design", author: "Herbert T. Pherbhert", category: "Programming", price: 250, year: 2021, edition: "1st", copies: 3, available: 1, shelf: "B-07", condition: "Good", description: "Modern web design principles.", rating: 4.1, latest: "2026-10-17", image: "images/eloquent-web-design.jpg", isPremium: false },
    { id: "BK-106", title: "Computer Organization and Design", author: "Robert B. Stark", category: "Computer Engineering", price: 280, year: 2020, edition: "5th", copies: 4, available: 3, shelf: "C-01", condition: "Good", description: "Hardware/software interface.", rating: 4.4, latest: "2026-10-17", image: "images/computer-organization-and-design.jpg", isPremium: false },
    { id: "BK-107", title: "Computer Architecture", author: "Bruce Banter", category: "Computer Engineering", price: 270, year: 2019, edition: "2nd", copies: 3, available: 2, shelf: "C-04", condition: "Fair", description: "Quantitative architecture.", rating: 4.2, latest: "2026-10-17", image: "images/computer-architecture.jpg", isPremium: false },
    { id: "BK-108", title: "Digital Design", author: "Dixon Nixon", category: "Computer Engineering", price: 260, year: 2021, edition: "1st", copies: 5, available: 4, shelf: "C-09", condition: "Excellent", description: "Digital logic fundamentals.", rating: 4.0, latest: "2026-10-17", image: "images/digital-design.jpg", isPremium: false },
    { id: "BK-109", title: "Electronics Circuits", author: "Krey Thos", category: "Computer Engineering", price: 240, year: 2018, edition: "3rd", copies: 4, available: 2, shelf: "C-11", condition: "Good", description: "Electronic circuit analysis.", rating: 3.9, latest: "2026-10-17", image: "images/electronics-circuits.jpg", isPremium: false },
    { id: "BK-110", title: "Embedded System", author: "Kirk Cobain", category: "Computer Engineering", price: 290, year: 2022, edition: "1st", copies: 3, available: 3, shelf: "C-14", condition: "Excellent", description: "Embedded systems design.", rating: 4.3, latest: "2026-10-17", image: "images/embedded-system.jpg", isPremium: false },
    { id: "BK-111", title: "Computer Networking", author: "Steve Nash", category: "Networking", price: 320, year: 2021, edition: "8th", copies: 5, available: 3, shelf: "D-02", condition: "Good", description: "Top-down networking approach.", rating: 4.6, latest: "2026-10-17", image: "images/computer-networking.jpg", isPremium: false },
    { id: "BK-112", title: "Network Communication", author: "Kwah Liti", category: "Networking", price: 230, year: 2020, edition: "2nd", copies: 4, available: 4, shelf: "D-05", condition: "Good", description: "Network protocols.", rating: 4.0, latest: "2026-10-17", image: "images/network-communication.jpg", isPremium: false },
    { id: "BK-113", title: "Introduction to Internet", author: "LeBrown Jeims", category: "Networking", price: 200, year: 2019, edition: "1st", copies: 6, available: 5, shelf: "D-08", condition: "Fair", description: "Internet basics.", rating: 3.8, latest: "2026-10-17", image: "images/introduction-to-internet.jpg", isPremium: false },
    { id: "BK-114", title: "Data Networking", author: "Halt and Others", category: "Networking", price: 250, year: 2022, edition: "1st", copies: 3, available: 1, shelf: "D-12", condition: "Good", description: "Data communication concepts.", rating: 4.1, latest: "2026-10-17", image: "images/data-networking.jpg", isPremium: false },
    { id: "BK-115", title: "TCP/IP Illustrated", author: "Walter Black", category: "Networking", price: 310, year: 2018, edition: "2nd", copies: 4, available: 2, shelf: "D-15", condition: "Good", description: "TCP/IP protocol suite.", rating: 4.5, latest: "2026-10-17", image: "images/tcp-ip-illustrated.jpg", isPremium: false },
    { id: "BK-116", title: "Security Engineering", author: "Robert B. Stark", category: "Cybersecurity", price: 350, year: 2020, edition: "3rd", copies: 3, available: 2, shelf: "E-01", condition: "Excellent", description: "Building secure systems.", rating: 4.7, latest: "2026-10-17", image: "images/security-engineering.jpg", isPremium: false },
    { id: "BK-117", title: "Hacking: The Art of Exploitation", author: "Jonathan Klied", category: "Cybersecurity", price: 280, year: 2019, edition: "2nd", copies: 4, available: 1, shelf: "E-04", condition: "Good", description: "Hands-on hacking techniques.", rating: 4.4, latest: "2026-10-17", image: "images/hacking-the-art-of-exploitation.jpg", isPremium: false },
    { id: "BK-118", title: "Blue Team Handbook", author: "Anna Klied", category: "Cybersecurity", price: 260, year: 2021, edition: "1st", copies: 5, available: 4, shelf: "E-07", condition: "Excellent", description: "Incident response guide.", rating: 4.2, latest: "2026-10-17", image: "images/blue-team-handbook.jpg", isPremium: false },
    { id: "BK-119", title: "Threat Modeling", author: "Frank Einstein", category: "Cybersecurity", price: 240, year: 2022, edition: "1st", copies: 3, available: 3, shelf: "E-10", condition: "Good", description: "Security threat modeling.", rating: 4.0, latest: "2026-10-17", image: "images/threat-modeling.jpg", isPremium: false },
    { id: "BK-120", title: "Introduction to Cryptography", author: "Alfred Camel", category: "Cybersecurity", price: 270, year: 2020, edition: "2nd", copies: 4, available: 2, shelf: "E-13", condition: "Good", description: "Cryptography fundamentals.", rating: 4.3, latest: "2026-10-17", image: "images/introduction-to-cryptography.jpg", isPremium: false },
    { id: "BK-121", title: "Hands-On Machine Learning", author: "Seiy Antis", category: "AI and Data Science", price: 380, year: 2022, edition: "3rd", copies: 5, available: 3, shelf: "F-02", condition: "Excellent", description: "Practical ML with Python.", rating: 4.8, latest: "2026-10-17", image: "images/hands-on-machine-learning.jpg", isPremium: false },
    { id: "BK-122", title: "Deep Learning", author: "Magnus Nakamura", category: "AI and Data Science", price: 400, year: 2021, edition: "1st", copies: 3, available: 1, shelf: "F-05", condition: "Good", description: "Deep learning introduction.", rating: 4.6, latest: "2026-10-17", image: "images/deep-learning.jpg", isPremium: false },
    { id: "BK-123", title: "Artificial Intelligence: A Modern Approach", author: "Robert B. Stark", category: "AI and Data Science", price: 420, year: 2020, edition: "4th", copies: 4, available: 2, shelf: "F-08", condition: "Excellent", description: "The definitive AI textbook.", rating: 4.9, latest: "2026-10-17", image: "images/artificial-intelligence-a-modern-approach.jpg", isPremium: false },
    { id: "BK-124", title: "Python for Machine Learning", author: "Hadji Glitch", category: "AI and Data Science", price: 290, year: 2023, edition: "2nd", copies: 6, available: 5, shelf: "F-11", condition: "Good", description: "ML projects with Python.", rating: 4.4, latest: "2026-10-17", image: "images/python-for-machine-learning.jpg", isPremium: false },
    { id: "BK-125", title: "Data Science from Scratch", author: "Kirk Cobain", category: "AI and Data Science", price: 310, year: 2019, edition: "2nd", copies: 4, available: 3, shelf: "F-14", condition: "Good", description: "Data science fundamentals.", rating: 4.5, latest: "2026-10-17", image: "images/data-science-from-scratch.jpg", isPremium: false }
];

const premiumTopics = ["Programming", "Computer Engineering", "Networking", "Cybersecurity", "AI and Data Science"];
const premiumAuthors = ["Robert B. Stark", "Xean M. Verutacio", "Y. Daniel Liang", "Eric Banner", "Herbert T. Pherbhert", "Steve Nash", "Jonathan Klied", "Seiy Antis", "Magnus Nakamura"];
for (let i = 1; i <= 75; i++) {
    const topic = premiumTopics[(i - 1) % premiumTopics.length];
    const author = premiumAuthors[(i - 1) % premiumAuthors.length];
    defaultBooks.push({
        id: `PBK-${200 + i}`,
        title: `Advanced ${topic} Masterclass Vol. ${i}`,
        author: author,
        category: topic,
        price: 500 + (i * 10),
        year: 2025,
        edition: "VIP 1st",
        copies: 5,
        available: 5,
        shelf: `VIP-${i}`,
        condition: "Pristine",
        description: `Exclusive VIP Premium book covering expert-level concepts in ${topic}.`,
        rating: 5.0,
        latest: "2026-10-17",
        image: `images/premium-book-${String(i).padStart(3, "0")}.jpg`,
        isPremium: true
    });
}

const defaultSales = { today: 3500, month: 16500, pending: 3, returns: 1, count: 5 };

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

let books = (() => {
    const saved = readJSON(STORAGE_KEYS.books, null);
    const baseList = Array.isArray(saved) && saved.length ? saved : defaultBooks.map(b => ({ ...b }));
    const mergedById = new Map();

    baseList.forEach(book => {
        if (book && book.id) mergedById.set(book.id, book);
    });

    defaultBooks.forEach(book => {
        if (!mergedById.has(book.id)) mergedById.set(book.id, { ...book });
    });

    return [...mergedById.values()].map(b => {
        const base = defaultBooks.find(item => item.id === b.id) || {};
        const merged = {
            copies: 3,
            available: 2,
            shelf: "A-01",
            condition: "Good",
            description: "",
            year: 2020,
            edition: "1st",
            rating: 4.0,
            image: "images/no-cover.jpg",
            isPremium: false,
            ...base,
            ...b
        };
        if (!merged.shelf || merged.shelf === "A-01") merged.shelf = base.shelf || merged.shelf;
        if (!merged.year || merged.year === 2020) merged.year = base.year || merged.year;
        if (merged.rating == null) merged.rating = base.rating ?? merged.rating;
        if (!merged.description || merged.description.length < 5) merged.description = base.description || merged.description;
        if (merged.copies == null) merged.copies = base.copies ?? 3;
        if (merged.available == null) merged.available = base.available ?? 2;
        if (
            base.image &&
            (/^image\/cover\/BK-\d+\.jpg$/i.test(merged.image || "") ||
                /^images\/no-cover\.jpg$/i.test(merged.image || ""))
        ) {
            merged.image = base.image;
        }
        return merged;
    });
})();

let cartByUser = readJSON(STORAGE_KEYS.cart, {});
if (Array.isArray(cartByUser)) cartByUser = { _legacy: cartByUser };
if (typeof cartByUser !== "object" || cartByUser === null) cartByUser = {};

let favoritesByUser = readJSON(STORAGE_KEYS.favorites, {});
if (Array.isArray(favoritesByUser)) favoritesByUser = { _legacy: favoritesByUser };
if (typeof favoritesByUser !== "object" || favoritesByUser === null) favoritesByUser = {};

let recentByUser = readJSON(STORAGE_KEYS.recentlyViewed, {});
if (Array.isArray(recentByUser)) recentByUser = { _legacy: recentByUser };
if (typeof recentByUser !== "object" || recentByUser === null) recentByUser = {};

let cart = [];
let favorites = [];
let recentlyViewed = [];

let sales = Object.assign({}, defaultSales, readJSON(STORAGE_KEYS.sales, {}));

let borrows = readJSON(STORAGE_KEYS.borrows, []);
if (!Array.isArray(borrows)) borrows = [];

let purchases = readJSON(STORAGE_KEYS.purchases, []);
if (!Array.isArray(purchases)) purchases = [];

let reports = readJSON(STORAGE_KEYS.reports, []);
if (!Array.isArray(reports)) reports = [];

let userRatings = readJSON(STORAGE_KEYS.userRatings, {});

let notifications = readJSON(STORAGE_KEYS.notifications, [
    {
        id: 1,
        title: "Welcome!",
        message: "Explore our library catalog and borrow your favorite books.",
        time: "Just now",
        read: false
    }
]);

let currentUser = null;
let currentRole = "user";
let currentRatingBookId = null;
let selectedRatingStars = 5;
let reportingTargetType = null;
let reportingTargetId = null;
let aiChatHistory = [];
let aiAssistantBusy = false;

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".side-nav-item[data-page]");
const appShell = document.getElementById("appShell");
const loginPage = document.getElementById("loginPage");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");

function isUsernameInput(input) {
    return input instanceof HTMLInputElement && input.matches("#username, #signupUsername, #settingsUsername, #recoveryUsername, #friendUsernameInput");
}

function isPersonNameInput(input) {
    return input instanceof HTMLInputElement && input.matches("#signupPenName, #settingsPenName");
}

function hasInvalidPasswordCharacters(value) {
    return /[^\p{L}\p{M}\p{N}_@#?!-]/u.test(value);
}

function hasInvalidUsernameCharacters(value) {
    return /[^\p{L}\p{M}]/u.test(value);
}

document.addEventListener("keydown", event => {
    if (event.target instanceof HTMLInputElement && event.target.type === "password" && event.key.length === 1 && hasInvalidPasswordCharacters(event.key)) event.preventDefault();
    if (isUsernameInput(event.target) && event.key.length === 1 && /[^\p{L}\p{M}]/u.test(event.key)) event.preventDefault();
    if (isPersonNameInput(event.target) && /^\p{N}$/u.test(event.key)) event.preventDefault();
});

document.addEventListener("beforeinput", event => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (event.target.type === "password" && hasInvalidPasswordCharacters(event.data || "")) event.preventDefault();
    if (isUsernameInput(event.target) && /[^\p{L}\p{M}]/u.test(event.data || "")) event.preventDefault();
    if (isPersonNameInput(event.target) && /\p{N}/u.test(event.data || "")) event.preventDefault();
});

document.addEventListener("input", event => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const input = event.target;
    const isPassword = input.type === "password";
    const isUsername = isUsernameInput(input);
    const isPersonName = isPersonNameInput(input);
    if (!isPassword && !isUsername && !isPersonName) return;
    const pattern = isPassword ? /[^\p{L}\p{M}\p{N}_@#?!-]/gu : isUsername ? /[^\p{L}\p{M}]/gu : /\p{N}/gu;
    const value = input.value;
    const cursor = input.selectionStart ?? value.length;
    const clean = value.replace(pattern, "");
    if (clean === value) return;
    input.value = clean;
    const cleanCursor = value.slice(0, cursor).replace(pattern, "").length;
    input.setSelectionRange(cleanCursor, cleanCursor);
});

function showAuthForm(formName) {
    const isSignup = formName === "signup";

    loginForm?.classList.toggle("hidden", isSignup);
    signupForm?.classList.toggle("hidden", !isSignup);

    const title = document.getElementById("authTitle");
    const subtitle = document.getElementById("authSubtitle");

    if (title) title.textContent = isSignup ? "Create Account" : "Library Login";
    if (subtitle) subtitle.textContent = isSignup ? "Choose how you want to join" : "Sign in to manage your library";

    updateSignupType();

    if (loginError) loginError.textContent = "";
    if (signupError) signupError.textContent = "";
}

function getSavedAccounts() {
    const accounts = readJSON(AUTH_ACCOUNTS_KEY, []);
    return Array.isArray(accounts) ? accounts : [];
}

async function hashPassword(password, salt) {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Secure password storage is unavailable. Run this site using localhost or HTTPS.");
    }

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const saltBytes = new Uint8Array(
        salt.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: 100000,
            hash: "SHA-256"
        },
        key,
        256
    );

    return Array.from(new Uint8Array(bits), byte =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

function generatePasswordSalt() {
    return Array.from(
        crypto.getRandomValues(new Uint8Array(16)),
        byte => byte.toString(16).padStart(2, "0")
    ).join("");
}

function isAdmin(username) {
    if (["admin", "woopiiee"].includes(String(username || "").toLowerCase())) {
        return true;
    }

    const account = getSavedAccounts().find(
        item => item.username?.toLowerCase() === String(username || "").toLowerCase()
    );

    return (account?.role === "admin" || account?.role === "librarian") && !account?.banned;
}

function isLibrarianOrAdmin(username) {
    if (["admin", "woopiiee"].includes(String(username || "").toLowerCase())) {
        return true;
    }

    const account = getSavedAccounts().find(
        item => item.username?.toLowerCase() === String(username || "").toLowerCase()
    );

    return (account?.role === "admin" || account?.role === "librarian") && !account?.banned;
}

function isBuiltInAdmin(username) {
    return ["admin", "woopiiee"].includes(String(username || "").toLowerCase());
}

function loadUserScopedData(username) {
    const key = String(username || "").toLowerCase() || "_guest";
    cart = Array.isArray(cartByUser[key]) ? [...cartByUser[key]] : [];
    favorites = Array.isArray(favoritesByUser[key]) ? [...favoritesByUser[key]] : [];
    recentlyViewed = Array.isArray(recentByUser[key]) ? [...recentByUser[key]] : [];
}

function persistUserScopedData() {
    if (!currentUser) return;
    const key = String(currentUser).toLowerCase();
    cartByUser[key] = cart;
    favoritesByUser[key] = favorites;
    recentByUser[key] = recentlyViewed;
}

function getCurrentAccount() {
    return getSavedAccounts().find(
        item => item.username?.toLowerCase() === String(currentUser || "").toLowerCase()
    ) || null;
}

function isUserPremium(username) {
    if (["admin", "woopiiee"].includes(String(username || "").toLowerCase())) return true;
    const acc = getSavedAccounts().find(item => item.username?.toLowerCase() === String(username || "").toLowerCase());
    return acc?.membership === "premium" && !acc?.banned;
}

function setAuthenticated(isAuth, username = "") {
    appShell?.classList.toggle("hidden", !isAuth);
    loginPage?.classList.toggle("hidden", isAuth);

    if (isAuth) {
        currentUser = username || "admin";
        currentRole = isAdmin(currentUser) ? "admin" : "user";

        localStorage.setItem("libraryLoggedIn", "true");
        localStorage.setItem("libraryLoggedInUser", currentUser);

        const nameElement = document.getElementById("userDisplayName");
        if (nameElement) nameElement.textContent = currentUser;

        refreshRoleBadge();
        applyRoleVisibility();

        loadUserScopedData(currentUser);
        startChatSession();
        setTimeout(checkAuthorNotice, 600);

        const setUsernameInput = document.getElementById("settingsUsername");
        if (setUsernameInput) setUsernameInput.value = currentUser;
        const setEmailInput = document.getElementById("settingsEmail");
        if (setEmailInput) {
            const acc = getCurrentAccount();
            setEmailInput.value = acc?.email || "";
        }
    } else {
        endChatSession();
        if (currentUser) persistUserScopedData();
        currentUser = null;
        currentRole = "user";
        cart = [];
        favorites = [];
        recentlyViewed = [];

        localStorage.removeItem("libraryLoggedIn");
        localStorage.removeItem("libraryLoggedInUser");
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";

    if (hasInvalidUsernameCharacters(username)) {
        if (loginError) loginError.textContent = "Username can only contain letters.";
        return;
    }

    const accounts = getSavedAccounts();
    const savedAccount = accounts.find(
        account => account.username?.toLowerCase() === username.toLowerCase()
    );

    if (savedAccount?.banned) {
        if (loginError) {
            loginError.textContent = "This account has been banned. Contact a library administrator.";
        }
        return;
    }

    let valid =
        (username.toLowerCase() === "admin" && password === "admin123") ||
        (username.toLowerCase() === "woopiiee" && password === "Robbie");

    if (!valid && savedAccount) {
        try {
            valid = await hashPassword(password, savedAccount.salt) === savedAccount.passwordHash;
        } catch (error) {
            if (loginError) loginError.textContent = error.message;
            return;
        }
    }

    if (!valid) {
        if (loginError) loginError.textContent = "Invalid username or password.";
        return;
    }

    const officialName = isBuiltInAdmin(username)
        ? username.toLowerCase()
        : (savedAccount?.username || username);

    setAuthenticated(true, officialName);

    if (loginError) loginError.textContent = "";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    showPage(isLibrarianOrAdmin(currentUser) ? "dashboard" : "books");
    renderAll();
}

async function handleSignup(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("signupUsername");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    const confirmInput = document.getElementById("signupPasswordConfirm");

    if (!usernameInput || !emailInput || !passwordInput || !confirmInput || !signupError) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const isAuthorApplication = getSignupType() === "author";
    const penName = (document.getElementById("signupPenName")?.value || "").trim();
    const authorBio = (document.getElementById("signupAuthorBio")?.value || "").trim();

    if (!username || !password) {
        signupError.textContent = "Enter username and password.";
        return;
    }

    if (hasInvalidUsernameCharacters(username)) {
        signupError.textContent = "Username can only contain letters.";
        return;
    }

    if (isAuthorApplication) {
        const penProblem = validatePenName(penName);
        if (penProblem) {
            signupError.textContent = penProblem;
            return;
        }
    }

    if (password.length < 8) {
        signupError.textContent = "Password must be at least 8 characters.";
        return;
    }

    if (hasInvalidPasswordCharacters(password) || hasInvalidPasswordCharacters(confirmInput.value)) {
        signupError.textContent = "Password may only include letters, numbers, and _ @ - # ? !.";
        return;
    }

    if (password !== confirmInput.value) {
        signupError.textContent = "Passwords do not match.";
        return;
    }

    try {
        const accounts = getSavedAccounts();

        if (
            ["admin", "woopiiee"].includes(username.toLowerCase()) ||
            accounts.some(account => account.username?.toLowerCase() === username.toLowerCase())
        ) {
            signupError.textContent = "Username taken.";
            return;
        }

        const salt = generatePasswordSalt();
        const passwordHash = await hashPassword(password, salt);

        accounts.push({
            username,
            email: emailInput?.value.trim() || "",
            passwordHash,
            salt,
            role: "user",
            membership: "regular",
            banned: false,
            createdAt: today(),
            authorStatus: isAuthorApplication ? "pending" : "none",
            penName: isAuthorApplication ? penName : "",
            authorBio: isAuthorApplication ? authorBio : "",
            authorAppliedAt: isAuthorApplication ? today() : ""
        });

        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

        document.getElementById("username").value = username;
        signupForm.reset();
        showAuthForm("login");

        if (loginError) {
            loginError.textContent = isAuthorApplication
                ? "Author application sent! Log in as a reader now. An admin will review your application."
                : "Account created. Please log in.";
        }
    } catch (error) {
        signupError.textContent = error.message;
    }
}

function openForgotPasswordModal() {
    const modal = document.getElementById("forgotPasswordModal");
    if (!modal) return;
    document.getElementById("recoveryUsername").value = document.getElementById("username")?.value || "";
    document.getElementById("recoveryPasswordError").textContent = "";
    modal.classList.remove("hidden");
    requestAnimationFrame(() => {
        modal.classList.add("show");
        document.getElementById("recoveryUsername")?.focus();
    });
}

function closeForgotPasswordModal() {
    const modal = document.getElementById("forgotPasswordModal");
    if (!modal) return;
    modal.classList.remove("show");
    window.setTimeout(() => modal.classList.add("hidden"), 300);
}

async function resetForgottenPassword(event) {
    event.preventDefault();
    const username = document.getElementById("recoveryUsername")?.value.trim() || "";
    const email = document.getElementById("recoveryEmail")?.value.trim().toLowerCase() || "";
    const password = document.getElementById("recoveryNewPassword")?.value || "";
    const confirmation = document.getElementById("recoveryConfirmPassword")?.value || "";
    const error = document.getElementById("recoveryPasswordError");
    if (error) error.textContent = "";

    if (hasInvalidPasswordCharacters(password) || hasInvalidPasswordCharacters(confirmation)) {
        if (error) error.textContent = "Password may only include letters, numbers, and _ @ - # ? !.";
        return;
    }
    if (password.length < 8) {
        if (error) error.textContent = "Password must be at least 8 characters.";
        return;
    }
    if (password !== confirmation) {
        if (error) error.textContent = "Passwords do not match.";
        return;
    }

    const accounts = getSavedAccounts();
    const account = accounts.find(item => sameUser(item.username, username));
    if (!account || !account.email || account.email.trim().toLowerCase() !== email || isBuiltInAdmin(username)) {
        if (error) error.textContent = "We couldn't verify that username and email. Check the account details or contact library support.";
        return;
    }

    try {
        const salt = generatePasswordSalt();
        account.passwordHash = await hashPassword(password, salt);
        account.salt = salt;
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
        document.getElementById("forgotPasswordForm")?.reset();
        closeForgotPasswordModal();
        if (loginError) loginError.textContent = "Password reset. Sign in with your new password.";
    } catch (resetError) {
        if (error) error.textContent = resetError.message || "Could not reset the password.";
    }
}

let signOutModalOpener = null;

function openSignOutModal() {
    const modal = document.getElementById("signOutModal");
    if (!modal) return;
    signOutModalOpener = document.activeElement;
    modal.classList.remove("hidden");
    requestAnimationFrame(() => {
        modal.classList.add("show");
        document.getElementById("cancelSignOutButton")?.focus();
    });
}

function closeSignOutModal(restoreFocus = true) {
    const modal = document.getElementById("signOutModal");
    if (!modal) return;
    modal.classList.remove("show");
    window.setTimeout(() => {
        modal.classList.add("hidden");
        if (restoreFocus && signOutModalOpener?.isConnected) signOutModalOpener.focus();
        signOutModalOpener = null;
    }, 250);
}

function confirmSignOut() {
    closeSignOutModal(false);
    handleLogout();
}

function handleLogout() {
    setAuthenticated(false);
    loginForm?.reset();
    signupForm?.reset();
    showAuthForm("login");
    closeSidePanel();
}

let storageWarningShown = false;

function saveLibraryData() {
    persistUserScopedData();

    const entries = [
        [STORAGE_KEYS.books, books],
        [STORAGE_KEYS.cart, cartByUser],
        [STORAGE_KEYS.sales, sales],
        [STORAGE_KEYS.borrows, borrows],
        [STORAGE_KEYS.purchases, purchases],
        [STORAGE_KEYS.favorites, favoritesByUser],
        [STORAGE_KEYS.recentlyViewed, recentByUser],
        [STORAGE_KEYS.notifications, notifications],
        [STORAGE_KEYS.reports, reports],
        [STORAGE_KEYS.userRatings, userRatings]
    ];

    let failed = false;

    entries.forEach(([key, value]) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            failed = true;
        }
    });

    if (failed && !storageWarningShown) {
        storageWarningShown = true;
        alert("Your browser storage is full, so some changes may not be saved. Try deleting books with big pictures.");
    }
}

function formatCurrency(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatLocalDate(dateObject) {
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function today() {
    return formatLocalDate(new Date());
}

function addDays(date, numberOfDays) {
    const [year, month, day] = String(date).split("-").map(Number);
    return formatLocalDate(new Date(year, month - 1, day + numberOfDays));
}

function isOverdue(date) {
    return date < today();
}

const ADMIN_AUDIT_KEY = "libraryAdminAuditTrail";
const OVERDUE_SETTINGS_KEY = "libraryOverdueSettings";
const DEFAULT_OVERDUE_RATE = 10;

function getOverdueRate() {
    const settings = readJSON(OVERDUE_SETTINGS_KEY, {});
    return Math.max(0, Number(settings.penaltyPerDay ?? DEFAULT_OVERDUE_RATE) || 0);
}

function getDaysLate(dueDate, referenceDate = today()) {
    if (!dueDate || dueDate >= referenceDate) return 0;
    const due = new Date(`${dueDate}T00:00:00Z`);
    const reference = new Date(`${referenceDate}T00:00:00Z`);
    return Math.max(0, Math.floor((reference - due) / 86400000));
}

function notifyCurrentUserOverdueLoans() {
    if (!currentUser) return;
    borrows.filter(loan => sameUser(loan.username, currentUser) && !loan.returned && isOverdue(loan.dueDate) && !loan.overdueNoticeSent).forEach(loan => {
        const days = getDaysLate(loan.dueDate);
        loan.overdueNoticeSent = true;
        addNotification("Overdue book reminder", `"${loan.title || loan.id}" is ${days} day(s) overdue. Estimated penalty: ${formatCurrency(days * getOverdueRate())}. Please return it.`);
    });
}

function recordAdminAction(action, details) {
    if (!currentUser || !isLibrarianOrAdmin(currentUser)) return;
    const entries = readJSON(ADMIN_AUDIT_KEY, []);
    entries.unshift({ timestamp: new Date().toISOString(), account: currentUser, action, details });
    try { localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(entries.slice(0, 500))); } catch {}
}

function recordAuditEvent(action, details, account = currentUser) {
    if (!account) return;
    const entries = readJSON(ADMIN_AUDIT_KEY, []);
    entries.unshift({ timestamp: new Date().toISOString(), account, action, details });
    try { localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(entries.slice(0, 500))); } catch {}
}

function saveOverdueSettings() {
    if (!isLibrarianOrAdmin(currentUser)) return;
    const input = document.getElementById("overduePenaltyRate");
    const rate = Math.max(0, Number(input?.value) || 0);
    localStorage.setItem(OVERDUE_SETTINGS_KEY, JSON.stringify({ penaltyPerDay: rate }));
    recordAdminAction("Updated overdue penalty", `Set penalty to ${formatCurrency(rate)} per day.`);
    renderAdminPage();
}

function exportAdminReport() {
    if (!isLibrarianOrAdmin(currentUser)) return;
    const audit = readJSON(ADMIN_AUDIT_KEY, []);
    const rows = [["Section", "Date", "Account", "Action", "Details"],
        ...borrows.map(loan => ["Loan", loan.borrowedOn || "", loan.username || "", loan.returned ? "Returned" : isOverdue(loan.dueDate) ? "Overdue" : "Active", `${loan.title || loan.id}; due ${loan.dueDate || "—"}; days late ${getDaysLate(loan.dueDate)}; estimated penalty ${formatCurrency(getDaysLate(loan.dueDate) * getOverdueRate())}`]),
        ...audit.map(item => ["Audit", item.timestamp || "", item.account || "", item.action || "", item.details || ""])];
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `penetrative-library-admin-report-${today()}.csv`;
    link.click(); URL.revokeObjectURL(url);
}

function sameUser(a, b) {
    return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function getUserBorrows() {
    return borrows.filter(
        borrow => sameUser(borrow.username, currentUser) && !borrow.returned
    );
}

function getUserHistory() {
    return borrows
        .filter(borrow => sameUser(borrow.username, currentUser))
        .sort((a, b) => (b.borrowedOn || "").localeCompare(a.borrowedOn || ""));
}

function addNotification(title, message) {
    notifications.unshift({
        id: Date.now(),
        title,
        message,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }),
        read: !document.getElementById("notifDropdown")?.classList.contains("hidden")
    });

    saveLibraryData();
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById("notifList");
    const badge = document.getElementById("notifBadge");

    if (!list || !badge) return;

    const unreadCount = notifications.filter(notification => !notification.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }

    if (!notifications.length) {
        list.innerHTML = '<p class="empty">No notifications</p>';
        return;
    }

    list.innerHTML = notifications.map(notification => `
        <div class="notif-item ${notification.read ? "" : "unread"}">
            <strong>${escapeHTML(notification.title)}</strong>
            <p>${escapeHTML(notification.message)}</p>
            <time>${escapeHTML(notification.time)}</time>
        </div>
    `).join("");
}

function showPage(name) {
    if ((name === "dashboard" || name === "admin" || name === "support") && !isLibrarianOrAdmin(currentUser)) {
        name = "books";
    }

    if (name === "myBooks" && !isApprovedAuthor(currentUser)) {
        name = "books";
    }

    pages.forEach(page => page.classList.remove("active-page"));
    document.getElementById(name)?.classList.add("active-page");

    navItems.forEach(item => {
        item.classList.toggle("active", item.dataset.page === name);
    });

    const titles = {
        dashboard: "Dashboard",
        books: "Books Catalog",
        authors: "Authors Directory",
        borrow: "Borrow & Return",
        yourBooks: "Your Books",
        cart: "Cart",
        search: "Search",
        aiAssistant: "AI Assistant",
        profile: "Profile",
        settings: "Settings",
        myBooks: "My Books",
        messages: "Messages",
        techSupport: "Tech Support",
        support: "Support Inbox",
        admin: "Admin"
    };

    const subtitles = {
        dashboard: "Library overview",
        books: "Browse and borrow books",
        authors: "Author directory",
        borrow: "Max 3 books • 14 days • ₱10 borrow fee",
        yourBooks: "Your borrowed and purchased books",
        cart: "Your purchases",
        search: "Advanced filters",
        aiAssistant: "Book recommendations and reading help",
        profile: "Your account",
        settings: "Manage account preferences",
        myBooks: "Upload and manage your books",
        messages: "Friends & private chat",
        techSupport: "Help center & live chat",
        support: "Chat with members",
        admin: "Admin tools"
    };

    const titleElement = document.getElementById("pageTitle");
    const subtitleElement = document.getElementById("pageSubtitle");

    if (titleElement) titleElement.textContent = titles[name] || "Books Catalog";
    if (subtitleElement) subtitleElement.textContent = subtitles[name] || "";

    closeSidePanel();

    if (name === "support") renderSupportPage(true);
    if (name === "messages") renderMessagesPage(true);
    if (name === "techSupport") renderTechSupportPage();
    if (name === "aiAssistant") document.getElementById("aiChatInput")?.focus();
}

function isBookOwnedOrBorrowed(book) {
    if (!book || !currentUser) return false;
    if (book.isPremium && !isUserPremium(currentUser)) return false;
    const borrowed = getUserBorrows().some(loan => loan.id === book.id);
    const bought = purchases.some(order => sameUser(order.username, currentUser) && order.id === book.id);
    return borrowed || bought;
}

function hasPurchasedBook(bookId, username = currentUser) {
    return !!username && purchases.some(order => sameUser(order.username, username) && order.id === bookId);
}

function renderYourBooksPage() {
    const grid = document.getElementById("yourBooksGrid");
    if (!grid) return;
    const byId = new Map();
    getUserBorrows().forEach(loan => byId.set(loan.id, { id: loan.id, borrowed: true, purchased: false }));
    purchases.filter(order => sameUser(order.username, currentUser)).forEach(order => {
        const entry = byId.get(order.id) || { id: order.id, borrowed: false, purchased: false };
        entry.purchased = true;
        byId.set(order.id, entry);
    });
    const entries = [...byId.values()].map(entry => ({ ...entry, book: books.find(book => book.id === entry.id) })).filter(entry => entry.book);
    grid.innerHTML = entries.length ? entries.map(({ book, borrowed, purchased }) => `
        <article class="owned-book-card">
            <div class="owned-book-cover">${hasRealPicture(book.image) ? `<img src="${escapeHTML(book.image)}" alt="${escapeHTML(book.title)} cover" onerror="this.remove()">` : '<span aria-hidden="true">📖</span>'}</div>
            <div class="owned-book-info"><span class="owned-book-status">${borrowed && purchased ? "Owned · On loan" : borrowed ? "Currently borrowed" : "Purchased"}</span>
                <h3>${escapeHTML(book.title)}</h3><p>By ${escapeHTML(book.author || "Unknown author")}</p>
                <button type="button" class="primary-btn" onclick="openReader('${escapeHTML(book.id)}')">Read book</button>
            </div>
        </article>`).join("") : '<div class="owned-books-empty"><span>📚</span><h3>Your shelf is waiting</h3><p>Books you borrow or buy will show up here for easy reading.</p><button class="primary-btn" type="button" onclick="showPage(\'books\')">Browse books</button></div>';
}

function getReadableBookPages(book) {
    const supplied = Array.isArray(book.pages) ? book.pages.map(page => typeof page === "string" ? page : page?.content).filter(page => typeof page === "string" && page.trim()) : [];
    if (supplied.length) return { pages: supplied, demo: false };
    const title = book.title || "Untitled Book";
    const author = book.author || "Unknown author";
    const category = book.category || "General";
    const description = book.description || `An introduction to ${title} and its place in the ${category} collection.`;
    const subject = title.replace(/\s+Vol\.\s*\d+$/i, "");
    const guidance = /programming|software/i.test(category)
        ? { lens: "software as a set of small, explicit decisions", idea: "A useful program starts with a clear problem, names its inputs and expected results, and turns the work into steps that can be checked.", method: "Write a small example first. Trace each value through the steps, test one ordinary case and one boundary case, then improve the design without changing the result.", scenario: "Imagine a teammate must understand the code months from now. Clear names, focused functions, and a short explanation of why a choice was made can save more time than a clever shortcut.", exercise: "Choose one task from your own routine. Describe its input, output, and three steps before writing any code." }
        : /computer engineering|electronics|hardware|embedded/i.test(category)
            ? { lens: "the relationship between physical components and the instructions that control them", idea: "A computing system is easier to understand when its parts are followed from input to processing to output. Each connection carries a signal, a value, or a timing requirement.", method: "Draw the components and their connections, label what each signal means, then trace one complete operation. Check power, timing, and edge cases before changing the design.", scenario: "A sensor can report a value correctly while the device still behaves badly: a slow update, noisy connection, or mismatched voltage may distort the result. The whole path matters.", exercise: "Sketch a device you use. Mark its input, processing unit, storage or communication path, and output." }
            : /network|internet|communication/i.test(category)
                ? { lens: "how information travels across connected systems", idea: "A network exchange depends on more than a message: endpoints need an agreed format, a route, and a way to notice delay or failure.", method: "Follow a request from sender to receiver. At each step ask what is addressed, what is carried, what can be delayed, and how the sender learns whether delivery worked.", scenario: "When a service feels slow, the cause may be the device, local connection, route, server, or response size. Measuring each segment helps replace guessing with evidence.", exercise: "Map the journey from entering a website address to seeing its page. Note three places where a request could stall." }
                : /cyber|security|cryptography/i.test(category)
                    ? { lens: "protecting people, information, and systems under realistic conditions", idea: "Security begins by identifying what needs protection, who might affect it, and what harm a failure could cause. Controls work best when they address a specific risk.", method: "List the important assets, sketch likely threats, estimate impact and likelihood, then choose a safeguard. Revisit the plan whenever the system or its users change.", scenario: "A strong password helps, but a convincing message can still trick someone into giving away access. Layered defenses reduce the chance that one mistake becomes a serious incident.", exercise: "Pick an account or device. Name one valuable asset, one plausible threat, and two practical safeguards." }
                    : /ai|data science|machine learning/i.test(category)
                        ? { lens: "turning data into conclusions that can be checked", idea: "A model or analysis is only as useful as the question, the data, and the assumptions behind it. A confident result can still be misleading when those foundations are weak.", method: "Define the question, inspect where the data came from, look for missing or uneven examples, build a simple baseline, and compare results against cases the system has not seen.", scenario: "A high average score may hide poor performance for a smaller group. Looking at errors by case can reveal who benefits, who is missed, and what needs to change.", exercise: "Write one question you could answer with data. List the information you would need and one way the result might be biased." }
                        : { lens: `the ideas and practical questions surrounding ${subject}`, idea: `${description} A helpful way to begin is to separate what is known, what is assumed, and what still needs a clearer explanation.`, method: "Start with a question, gather dependable evidence, compare more than one explanation, and record how each conclusion follows from what you observed.", scenario: `Consider a real situation connected to ${subject}. The details may be incomplete, so identify what additional evidence would help you make a fair and useful decision.`, exercise: `Write one question about ${subject}. Note what you already know, what you would need to learn, and where you could look for a reliable answer.` };
    const pages = [
        `A first look at ${subject}\nBy ${author}\n\n${description}\n\nEvery subject becomes easier to explore when it is connected to a question that matters. This preview approaches ${subject} through ${guidance.lens}. As you read, notice which parts are facts, which are choices, and which depend on the situation.\n\nThe aim of this sample is to give this title its own starting point, drawn from its catalog details and subject area.`,
        `The central idea\n\n${guidance.idea}\n\nFor ${subject}, the useful habit is to slow down long enough to explain how one step leads to the next. When an explanation feels vague, ask for a concrete example and check whether the same reasoning still works.\n\nKeep the book's description in view: ${description}`, 
        `A method you can use\n\n${guidance.method}\n\nApply the method to one small case before trying a complicated one. Write down what you expected, what happened, and what you learned. A short record makes it easier to spot a mistaken assumption and to repeat a successful approach.\n\nThis approach gives the ideas in ${subject} a practical test instead of leaving them as definitions to memorize.`,
        `From idea to practice\n\n${guidance.scenario}\n\nThe details of a real example matter. Ask who is affected, what constraints exist, and what evidence would change your mind. Then compare possible responses by their benefits, risks, and cost.\n\nThis kind of careful reasoning connects ${subject} to the wider ${category} field and helps turn an abstract idea into a decision you can explain.`,
        `Review and next steps\n\nReturn to the description: ${description}\n\nWhat question does ${subject} help answer? Which part of the method would you try first, and what would count as a good result? Summarize the answer in your own words, then name one thing you still want to investigate.\n\nTry this: ${guidance.exercise}\n\nEnd of the custom sample preview for ${title}.`
    ];
    return { demo: true, pages };
}

let activeBookReader = { book: null, pages: [], page: 0, opener: null };
function ensureBookReader() {
    let modal = document.getElementById("bookReaderModal");
    if (modal) return modal;
    document.body.insertAdjacentHTML("beforeend", `<div id="bookReaderModal" class="book-reader-modal hidden" role="dialog" aria-modal="true" aria-labelledby="readerTitle">
        <div class="book-reader-backdrop" data-reader="close"></div><section class="book-reader-shell">
        <header class="book-reader-top"><div><span class="reader-eyebrow">PENETRATIVE LIBRARY · READING ROOM</span><h1 id="readerTitle"></h1><p id="readerByline"></p></div><button class="reader-exit" data-reader="close" aria-label="Close reader">×</button></header>
        <p id="readerSampleNote" class="reader-sample-note hidden"></p>
        <div class="reader-progress-area"><div class="reader-progress-caption"><span>YOUR PROGRESS</span><span id="readerProgressText">0%</span></div><div class="reader-progress-track"><span id="readerProgressFill"></span></div></div>
        <div class="reader-toolbar"><div class="reader-tool-group"><button type="button" data-reader="font-down" aria-label="Decrease text size">A−</button><button type="button" data-reader="font-up" aria-label="Increase text size">A+</button><button type="button" data-reader="contrast" aria-pressed="false">◐ Contrast</button></div>
        <div class="reader-narrator"><button type="button" class="reader-listen" data-reader="listen">🔊 Listen</button><button type="button" data-reader="stop-voice" disabled>Stop</button><label>Voice <select id="readerVoice"><option value="">Default</option></select></label><label>Speed <select id="readerRate"><option value="0.8">Slow</option><option value="1" selected>Normal</option><option value="1.2">Fast</option></select></label><span id="readerVoiceStatus" aria-live="polite">Narrator ready</span></div></div>
        <main class="reader-page-wrap"><article id="readerPage" class="reader-page" tabindex="0" aria-label="Book page"></article></main>
        <footer class="reader-page-nav"><button type="button" class="reader-prev" data-reader="previous">← Previous</button><span id="readerPageNumber" aria-live="polite"></span><button type="button" class="reader-next" data-reader="next">Next →</button></footer></section></div>`);
    modal = document.getElementById("bookReaderModal");
    modal.addEventListener("click", event => {
        const action = event.target.closest("[data-reader]")?.dataset.reader;
        if (!action) return;
        if (action === "close") closeBookReader();
        if (action === "previous") moveReaderPage(activeBookReader.page - 1);
        if (action === "next") moveReaderPage(activeBookReader.page + 1);
        if (action === "font-down") changeReaderFont(-2);
        if (action === "font-up") changeReaderFont(2);
        if (action === "contrast") toggleReaderContrast();
        if (action === "listen") toggleReaderNarration();
        if (action === "stop-voice") stopReaderNarration();
    });
    modal.addEventListener("change", event => { if (event.target.id === "readerVoice") updateReaderVoiceStatus("Voice selected."); });
    return modal;
}
function openReader(bookId) {
    const book = books.find(item => item.id === bookId);
    if (!book) return;
    if (!isBookOwnedOrBorrowed(book)) { alert("Borrow or buy this book before reading it."); return; }
    const content = getReadableBookPages(book);
    const key = String(currentUser).toLowerCase();
    const progress = readJSON("libraryReadingProgress", {});
    const savedPage = Number(progress[key]?.[book.id]?.page) || 1;
    activeBookReader = { book, pages: content.pages, page: Math.min(Math.max(savedPage - 1, 0), content.pages.length - 1), opener: document.activeElement };
    const modal = ensureBookReader();
    document.getElementById("readerTitle").textContent = book.title;
    document.getElementById("readerByline").textContent = `By ${book.author || "Unknown author"} · ${book.category || "General"}`;
    const note = document.getElementById("readerSampleNote");
    note.textContent = "Custom sample preview for this title. Full published book text is not included in this frontend demo.";
    note.classList.toggle("hidden", !content.demo);
    modal.classList.remove("hidden");
    document.body.classList.add("reader-lock-scroll");
    renderReaderPage();
    loadReaderVoices();
    document.getElementById("readerPage")?.focus();
}
function renderReaderPage() {
    if (!activeBookReader.book) return;
    const page = activeBookReader.pages[activeBookReader.page] || "";
    document.getElementById("readerPage").innerHTML = page.split(/\n{2,}/).map(part => `<p>${escapeHTML(part).replace(/\n/g, "<br>")}</p>`).join("");
    const current = activeBookReader.page + 1;
    const total = activeBookReader.pages.length;
    document.getElementById("readerPageNumber").textContent = `Page ${current} of ${total}`;
    const percent = Math.round(current / total * 100);
    document.getElementById("readerProgressText").textContent = `${percent}%`;
    document.getElementById("readerProgressFill").style.width = `${percent}%`;
    document.querySelector(".reader-progress-track")?.setAttribute("aria-valuenow", String(percent));
    document.querySelector('[data-reader="previous"]').disabled = current <= 1;
    document.querySelector('[data-reader="next"]').disabled = current >= total;
    const saved = readJSON("libraryReadingProgress", {});
    const key = String(currentUser).toLowerCase();
    saved[key] = saved[key] || {};
    saved[key][activeBookReader.book.id] = { page: current, total };
    try { localStorage.setItem("libraryReadingProgress", JSON.stringify(saved)); } catch {}
}
function moveReaderPage(page) {
    if (page < 0 || page >= activeBookReader.pages.length) return;
    stopReaderNarration();
    activeBookReader.page = page;
    renderReaderPage();
    document.getElementById("readerPage").scrollTop = 0;
}
function changeReaderFont(amount) {
    const page = document.getElementById("readerPage");
    const size = Number.parseInt(getComputedStyle(page).fontSize, 10) || 20;
    page.style.fontSize = `${Math.min(32, Math.max(15, size + amount))}px`;
}
function toggleReaderContrast() {
    const modal = document.getElementById("bookReaderModal");
    const enabled = modal.classList.toggle("reader-contrast");
    modal.querySelector('[data-reader="contrast"]')?.setAttribute("aria-pressed", String(enabled));
}
function loadReaderVoices() {
    if (!window.speechSynthesis) return;
    const select = document.getElementById("readerVoice");
    const voices = speechSynthesis.getVoices();
    const selected = select.value;
    if (voices.length) {
        select.replaceChildren(new Option("Default", ""));
        voices.forEach(voice => select.add(new Option(`${voice.name}${voice.lang ? ` · ${voice.lang}` : ""}`, voice.voiceURI)));
        if ([...select.options].some(option => option.value === selected)) select.value = selected;
    }
}
function updateReaderVoiceStatus(message) { const status = document.getElementById("readerVoiceStatus"); if (status) status.textContent = message; }
function toggleReaderNarration() {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { updateReaderVoiceStatus("Text-to-speech is unavailable in this browser."); return; }
    const speech = window.speechSynthesis;
    const button = document.querySelector('[data-reader="listen"]');
    if (speech.speaking && !speech.paused) { speech.pause(); button.textContent = "▶ Resume"; updateReaderVoiceStatus("Narration paused."); return; }
    if (speech.paused) { speech.resume(); button.textContent = "⏸ Pause"; updateReaderVoiceStatus("Reading this page aloud."); return; }
    const text = document.getElementById("readerPage")?.innerText.trim();
    if (!text) return;
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceURI = document.getElementById("readerVoice")?.value;
    const voice = speech.getVoices().find(item => item.voiceURI === voiceURI);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    utterance.rate = Number(document.getElementById("readerRate")?.value) || 1;
    utterance.onstart = () => { button.textContent = "⏸ Pause"; updateReaderVoiceStatus("Reading this page aloud."); };
    utterance.onend = () => { button.textContent = "🔊 Listen"; updateReaderVoiceStatus("Finished this page."); };
    utterance.onerror = () => { button.textContent = "🔊 Listen"; updateReaderVoiceStatus("Narration could not start."); };
    speech.speak(utterance);
    const stop = document.querySelector('[data-reader="stop-voice"]'); if (stop) stop.disabled = false;
}
function stopReaderNarration() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    const button = document.querySelector('[data-reader="listen"]'); if (button) button.textContent = "🔊 Listen";
    const stop = document.querySelector('[data-reader="stop-voice"]'); if (stop) stop.disabled = true;
    if (document.getElementById("readerVoiceStatus")) updateReaderVoiceStatus("Narration stopped.");
}
function closeBookReader() {
    const modal = document.getElementById("bookReaderModal");
    if (!modal) return;
    stopReaderNarration();
    modal.classList.add("hidden");
    document.body.classList.remove("reader-lock-scroll");
    activeBookReader.opener?.focus?.();
    activeBookReader = { book: null, pages: [], page: 0, opener: null };
}
document.addEventListener("keydown", event => {
    if (!activeBookReader.book) return;
    if (event.key === "Escape") closeBookReader();
    if (["ArrowRight", "PageDown"].includes(event.key)) { event.preventDefault(); moveReaderPage(activeBookReader.page + 1); }
    if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); moveReaderPage(activeBookReader.page - 1); }
});
if (window.speechSynthesis) speechSynthesis.addEventListener?.("voiceschanged", loadReaderVoices);

function renderBookCard(book) {
    const isFavorite = favorites.includes(book.id);
    const isPremCard = book.isPremium;

    return `
        <div class="book-card ${isPremCard ? 'premium-card' : ''}">
            ${isPremCard ? '<span class="status premium-badge" style="margin-bottom:6px;">⭐ PREMIUM</span>' : ''}
            ${hasRealPicture(book.image) ? `<img class="book-card-cover" src="${escapeHTML(book.image)}" alt="${escapeHTML(book.title)} cover" loading="lazy" onerror="tryNextCoverFormat(this)">` : ''}
            <h4>${escapeHTML(book.title)}</h4>
            <div class="meta">${escapeHTML(book.author)} · ${book.year || "—"}</div>
            <div class="meta">★ ${book.rating || "—"} · ${book.available || 0} avail</div>
            <div class="meta">Shelf: ${escapeHTML(book.shelf || "—")}</div>
            <div class="actions">
                <button class="action-btn" onclick="borrowBook('${escapeHTML(book.id)}')">Borrow</button>
                ${isBookOwnedOrBorrowed(book) ? `<button class="action-btn read-book-action" onclick="openReader('${escapeHTML(book.id)}')">Read</button>` : ""}
                <button class="action-btn fav" onclick="toggleFavorite('${escapeHTML(book.id)}')">${isFavorite ? "♥" : "♡"}</button>
                ${hasPurchasedBook(book.id) ? `<button class="action-btn rate" onclick="openRateModal('${escapeHTML(book.id)}')">Rate</button>` : ""}
                <button class="action-btn report" onclick="openReportModal('book', '${escapeHTML(book.id)}')">Report</button>
                <button class="action-btn" onclick="viewBook('${escapeHTML(book.id)}')">View</button>
            </div>
        </div>
    `;
}

function renderDashboard() {
    if (!isLibrarianOrAdmin(currentUser)) return;

    document.getElementById("totalBooks").textContent = books.length;
    document.getElementById("totalCopies").textContent = books.reduce(
        (sum, book) => sum + (Number(book.copies) || 0), 0
    );
    document.getElementById("availableCount").textContent = books.reduce(
        (sum, book) => sum + (Number(book.available) || 0), 0
    );

    const activeBorrows = getUserBorrows();

    document.getElementById("myBorrowed").textContent = activeBorrows.length;
    document.getElementById("overdueCount").textContent = activeBorrows.filter(
        borrow => isOverdue(borrow.dueDate)
    ).length;

    document.getElementById("todaySales").textContent = formatCurrency(sales.today);

    const newArrivals = [...books]
        .sort((a, b) => (b.latest || "").localeCompare(a.latest || ""))
        .slice(0, 6);

    document.getElementById("newArrivals").innerHTML =
        newArrivals.map(renderBookCard).join("") || '<p class="empty">No books</p>';

    const popularBooks = [...books]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);

    document.getElementById("popularBooks").innerHTML =
        popularBooks.map(renderBookCard).join("") || '<p class="empty">No books</p>';

    const recentBooks = recentlyViewed
        .map(id => books.find(book => book.id === id))
        .filter(Boolean)
        .slice(0, 6);

    document.getElementById("recentlyViewed").innerHTML =
        recentBooks.length
            ? recentBooks.map(renderBookCard).join("")
            : '<p class="empty">None yet</p>';
}

function populateCategoryFilters() {
    const categories = [...new Set(books.map(book => book.category).filter(Boolean))].sort();

    ["filterCategory", "searchCategory"].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        const currentValue = select.value;

        select.innerHTML =
            '<option value="">Category</option>' +
            categories.map(category =>
                `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
            ).join("");

        select.value = currentValue;
    });

    const years = [...new Set(books.map(book => book.year).filter(Boolean))]
        .sort((a, b) => b - a);

    const yearSelect = document.getElementById("searchYear");

    if (yearSelect) {
        const currentValue = yearSelect.value;

        yearSelect.innerHTML =
            '<option value="">Year</option>' +
            years.map(year => `<option value="${year}">${year}</option>`).join("");

        yearSelect.value = currentValue;
    }
}

function renderBooksPage() {
    const grid = document.getElementById("bookGrid");
    if (!grid) return;

    const query = (document.getElementById("booksSearch")?.value || "").toLowerCase().trim();
    const availabilityFilter = document.getElementById("filterAvailability")?.value || "";
    const categoryFilter = document.getElementById("filterCategory")?.value || "";
    const sort = document.getElementById("sortBooks")?.value || "title";

    let filteredBooks = books.filter(book => {
        const searchableText = [
            book.id,
            book.title,
            book.author,
            book.category,
            book.shelf,
            book.description
        ].join(" ").toLowerCase();

        if (query && !searchableText.includes(query)) return false;
        if (categoryFilter && book.category !== categoryFilter) return false;

        if (availabilityFilter === "Available" && (book.available || 0) <= 0) {
            return false;
        }

        if (
            availabilityFilter === "Borrowed" &&
            (book.available || 0) >= (book.copies || 0)
        ) {
            return false;
        }

        if (availabilityFilter === "Regular" && book.isPremium) return false;
        if (availabilityFilter === "Premium" && !book.isPremium) return false;

        return true;
    });

    filteredBooks.sort((a, b) => {
        if (sort === "author") return (a.author || "").localeCompare(b.author || "");
        if (sort === "year") return (b.year || 0) - (a.year || 0);
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        return (a.title || "").localeCompare(b.title || "");
    });

    if (!filteredBooks.length) {
        grid.innerHTML = '<p class="empty" style="grid-column:1/-1;">No books found</p>';
        return;
    }

    const myActiveIds = new Set(getUserBorrows().map(b => b.id));

    grid.innerHTML = filteredBooks.map(book => {
        const status = (book.available || 0) > 0 ? "Available" : "Borrowed";
        const isFavorite = favorites.includes(book.id);
        const available = Number(book.available) || 0;
        const rating = Number(book.rating) || 0;
        const stars = "★".repeat(Math.min(5, Math.round(rating))) + "☆".repeat(Math.max(0, 5 - Math.round(rating)));
        const alreadyBorrowed = myActiveIds.has(book.id);
        const synopsis = (book.description || "").slice(0, 90);

        let primaryBtn;
        if (alreadyBorrowed) {
            primaryBtn = `<button class="primary-btn card-borrow-btn" style="background:linear-gradient(135deg,#059669,#047857);" onclick="returnBook('${escapeHTML(book.id)}')">Return</button>`;
        } else {
            primaryBtn = `<button class="primary-btn card-borrow-btn" onclick="borrowBook('${escapeHTML(book.id)}')" ${available <= 0 ? "disabled" : ""}>Borrow</button>`;
        }

        return `
            <div class="inventory-card ${book.isPremium ? 'premium-card' : ''}">
                <div class="inventory-card-cover ${hasRealPicture(book.image) ? "has-cover" : ""}">
                    ${hasRealPicture(book.image) ? `<img class="cover-img" src="${escapeHTML(book.image)}" alt="" loading="lazy" onerror="tryNextCoverFormat(this)">` : ""}
                    ${book.isPremium ? '<span class="premium-ribbon">⭐ PREMIUM</span>' : ''}
                    <div class="cover-placeholder">
                        <span class="cover-icon">📖</span>
                        <span class="cover-id">${escapeHTML(book.id)}</span>
                    </div>
                    <span class="status-pill status ${status.toLowerCase()}">${status}</span>
                </div>
                <div class="inventory-card-body">
                    <span class="card-category">${escapeHTML(book.category || "General")}</span>
                    <h4 class="card-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</h4>
                    <p class="card-author">${escapeHTML(book.author)} · ${book.year || "—"}</p>
                    ${synopsis ? `<p class="card-synopsis">${escapeHTML(synopsis)}${(book.description || "").length > 90 ? "…" : ""}</p>` : ""}
                    <div class="card-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-num">${rating.toFixed(1)}</span>
                    </div>
                    <div class="card-meta-row">
                        <span class="card-price">${formatCurrency(book.price)}</span>
                        <span class="card-copies">${available} available · Shelf ${escapeHTML(book.shelf || "—")}</span>
                    </div>
                    <div class="card-actions">
                        ${primaryBtn}
                        <button class="action-btn" onclick="addToCart('${escapeHTML(book.id)}')" title="Buy">🛒</button>
                        <button class="action-btn fav" onclick="toggleFavorite('${escapeHTML(book.id)}')" title="Favorite">${isFavorite ? "♥" : "♡"}</button>
                        ${hasPurchasedBook(book.id) ? `<button class="action-btn rate" onclick="openRateModal('${escapeHTML(book.id)}')" title="Rate">★</button>` : ""}
                        <button class="action-btn report" onclick="openReportModal('book', '${escapeHTML(book.id)}')" title="Report">⚑</button>
                        <button class="action-btn" onclick="viewBook('${escapeHTML(book.id)}')" title="Details">👁</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function renderAuthorsPage() {
    const element = document.getElementById("authorList");
    if (!element) return;

    const authorMap = {};

    books.forEach(book => {
        if (!book.author) return;

        if (!authorMap[book.author]) authorMap[book.author] = [];
        authorMap[book.author].push(book);
    });

    const authors = Object.keys(authorMap).sort();

    element.innerHTML = authors.map(author => `
        <div class="author-card" onclick="filterByAuthor('${escapeHTML(author)}')">
            <h4>${escapeHTML(author)}</h4>
            <div class="meta">${authorMap[author].length} book${authorMap[author].length > 1 ? "s" : ""}</div>
        </div>
    `).join("") || '<p class="empty">No authors</p>';
}

function filterByAuthor(author) {
    showPage("books");

    const search = document.getElementById("booksSearch");

    if (search) {
        search.value = author;
        renderBooksPage();
    }
}

function renderBorrowPage() {
    const myTable = document.getElementById("myBorrowsTable");
    const historyTable = document.getElementById("historyTable");
    const activeBorrows = getUserBorrows();

    if (myTable) {
        myTable.innerHTML = activeBorrows.length
            ? activeBorrows.map(borrow => {
                const overdue = isOverdue(borrow.dueDate);

                return `
                    <tr>
                        <td>${escapeHTML(borrow.title)} ${borrow.isPremium ? '<span class="status premium-badge">⭐ VIP</span>' : ''}</td>
                        <td>${escapeHTML(borrow.borrowedOn)}</td>
                        <td>${escapeHTML(borrow.dueDate)}</td>
                        <td>${formatCurrency(borrow.borrowFee || 10)}</td>
                        <td>
                            <span class="status ${overdue ? "overdue" : "borrowed"}">
                                ${overdue ? "Overdue" : "Active"}
                            </span>
                        </td>
                        <td>
                            <button class="action-btn" onclick="returnBook('${escapeHTML(borrow.id)}')">Return</button>
                        </td>
                    </tr>
                `;
            }).join("")
            : '<tr><td colspan="6" class="empty">No active loans</td></tr>';
    }

    const history = getUserHistory();

    if (historyTable) {
        historyTable.innerHTML = history.length
            ? history.map(borrow => `
                <tr>
                    <td>${escapeHTML(borrow.title)}</td>
                    <td>${escapeHTML(borrow.borrowedOn)}</td>
                    <td>${escapeHTML(borrow.returnedOn || "—")}</td>
                    <td>
                        <span class="status ${
                            borrow.returned
                                ? "available"
                                : isOverdue(borrow.dueDate)
                                    ? "overdue"
                                    : "borrowed"
                        }">
                            ${
                                borrow.returned
                                    ? "Returned"
                                    : isOverdue(borrow.dueDate)
                                        ? "Overdue"
                                        : "Active"
                            }
                        </span>
                    </td>
                </tr>
            `).join("")
            : '<tr><td colspan="4" class="empty">No history</td></tr>';
    }
}

function renderCartPage() {
    const table = document.getElementById("cartTable");
    if (!table) return;

    table.innerHTML = cart.length
        ? cart.map(item => `
            <tr>
                <td>${escapeHTML(item.title)}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
                <td>
                    <button class="action-btn delete" onclick="removeFromCart('${escapeHTML(item.id)}')">Remove</button>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="5" class="empty">Cart empty</td></tr>';
}

function renderSearchPage() {
    const table = document.getElementById("searchResults");
    if (!table) return;

    const query = (document.getElementById("globalSearch")?.value || "").toLowerCase().trim();
    const category = document.getElementById("searchCategory")?.value || "";
    const year = document.getElementById("searchYear")?.value || "";
    const availability = document.getElementById("searchAvail")?.value || "";

    const filteredBooks = books.filter(book => {
        const searchableText = [book.id, book.title, book.author, book.category]
            .join(" ")
            .toLowerCase();

        if (query && !searchableText.includes(query)) return false;
        if (category && book.category !== category) return false;
        if (year && String(book.year) !== year) return false;
        if (availability === "Available" && (book.available || 0) <= 0) return false;

        return true;
    });

    table.innerHTML = filteredBooks.length
        ? filteredBooks.map(book => {
            const status = (book.available || 0) > 0 ? "Available" : "Borrowed";

            return `
                <tr>
                    <td><strong>${escapeHTML(book.title)}</strong></td>
                    <td>${escapeHTML(book.author)}</td>
                    <td>${escapeHTML(book.category)}</td>
                    <td>${book.year || "—"}</td>
                    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                    <td>${formatCurrency(book.price)}</td>
                </tr>
            `;
        }).join("")
        : '<tr><td colspan="6" class="empty">No matches</td></tr>';
}

function renderProfilePage() {
    const username = currentUser || "Reader";
    const account = getCurrentAccount();
    const activeBorrows = getUserBorrows();
    const history = getUserHistory();
    const isPrem = isUserPremium(currentUser);

    const returnedCount = history.filter(borrow => borrow.returned).length;
    const overdueCount = activeBorrows.filter(borrow => isOverdue(borrow.dueDate)).length;
    const baseRole = isLibrarianOrAdmin(currentUser) ? "Administrator" : (isPrem ? "Premium Member" : "Regular Member");
    const role = isApprovedAuthor(currentUser) ? `${baseRole} · Author` : baseRole;

    document.getElementById("profileUsername").textContent = username;
    document.getElementById("profileRole").textContent = role;
    document.getElementById("profileRoleDetail").textContent = role;
    document.getElementById("profileHeroName").textContent = username;

    const profileHeroContainer = document.getElementById("profileHeroContainer");
    const profileAvatar = document.getElementById("profileAvatar");
    const membershipActionArea = document.getElementById("membershipActionArea");

    if (isPrem) {
        profileHeroContainer?.classList.add("is-premium-hero");
        profileAvatar?.classList.add("is-premium-avatar");
        profileAvatar.textContent = "⭐";
        if (membershipActionArea) {
            membershipActionArea.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
                    <span class="status premium-badge" style="padding: 8px 14px; font-size: 13px;">✨ Premium Active (₱99/mo)</span>
                    <button class="secondary-btn" onclick="cancelSubscription()" style="padding:6px 12px; font-size:12px;">Cancel Subscription</button>
                </div>
            `;
        }
    } else {
        profileHeroContainer?.classList.remove("is-premium-hero");
        profileAvatar?.classList.remove("is-premium-avatar");
        profileAvatar.textContent = isLibrarianOrAdmin(currentUser) ? "👑" : (username.charAt(0).toUpperCase() || "👤");
        if (membershipActionArea) {
            membershipActionArea.innerHTML = `<button id="upgradePremiumBtn" class="primary-btn" onclick="openPremiumModal()">✨ Upgrade to Premium (₱99/mo)</button>`;
        }
    }

    document.getElementById("profileJoined").textContent = account?.createdAt
        ? `Member since ${account.createdAt}`
        : "Library administrator account";

    document.getElementById("profileBorrowed").textContent = activeBorrows.length;

    document.getElementById("profileFavorites").textContent = favorites.filter(
        id => books.some(book => book.id === id)
    ).length;

    document.getElementById("profileReturned").textContent = returnedCount;
    document.getElementById("profileOverdue").textContent = overdueCount;
    document.getElementById("profileTotalBorrows").textContent = history.length;

    document.getElementById("profileReadingStatus").textContent =
        overdueCount > 0
            ? "Return a book soon"
            : activeBorrows.length > 0
                ? "Enjoying a good read"
                : "Ready to explore";

    const favoriteBooks = favorites
        .map(id => books.find(book => book.id === id))
        .filter(Boolean);

    document.getElementById("favoritesList").innerHTML = favoriteBooks.length
        ? favoriteBooks.map(renderBookCard).join("")
        : '<p class="empty">No favorites yet. Tap ♡ on a book to save it here.</p>';

    const activity = document.getElementById("profileActivity");

    if (activity) {
        activity.innerHTML = history.length
            ? history.slice(0, 5).map(borrow => `
                <div class="activity-row">
                    <span class="activity-icon">
                        ${
                            borrow.returned
                                ? "✅"
                                : isOverdue(borrow.dueDate)
                                    ? "⚠️"
                                    : "📘"
                        }
                    </span>
                    <div>
                        <strong>${escapeHTML(borrow.title)}</strong>
                        <p>
                            ${
                                borrow.returned
                                    ? `Returned ${escapeHTML(borrow.returnedOn || "")}`
                                    : `Due ${escapeHTML(borrow.dueDate || "—")}`
                            }
                        </p>
                    </div>
                    <span class="activity-status">
                        ${
                            borrow.returned
                                ? "Returned"
                                : isOverdue(borrow.dueDate)
                                    ? "Overdue"
                                    : "Borrowed"
                        }
                    </span>
                </div>
            `).join("")
            : '<p class="empty">Your borrowing activity will appear here.</p>';
    }
}

function saveSettings(event) {
    event.preventDefault();
    const newUsername = document.getElementById("settingsUsername")?.value.trim();
    if (!newUsername) {
        alert("Username cannot be empty.");
        return;
    }

    if (hasInvalidUsernameCharacters(newUsername)) {
        alert("Display username can only contain letters.");
        return;
    }

    if (newUsername.toLowerCase() !== currentUser.toLowerCase()) {
        const accounts = getSavedAccounts();
        if (["admin", "woopiiee"].includes(newUsername.toLowerCase()) || accounts.some(acc => acc.username?.toLowerCase() === newUsername.toLowerCase())) {
            alert("Username is already taken.");
            return;
        }

        if (!isBuiltInAdmin(currentUser)) {
            const acc = accounts.find(item => item.username?.toLowerCase() === currentUser.toLowerCase());
            if (acc) {
                acc.username = newUsername;
                localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
            }
        }

        const previousName = currentUser;
        currentUser = newUsername;
        migrateUsernameData(previousName, newUsername);
        localStorage.setItem("libraryLoggedInUser", currentUser);
    }

    const email = document.getElementById("settingsEmail")?.value.trim() || "";
    if (email && !isBuiltInAdmin(currentUser)) {
        const accounts = getSavedAccounts();
        const acc = accounts.find(item => item.username?.toLowerCase() === currentUser.toLowerCase());
        if (acc) {
            acc.email = email;
            localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
        }
    }

    addNotification("Settings Updated", "Your account settings have been saved successfully.");
    alert("Settings saved successfully!");
    renderAll();
}

async function changePassword(event) {
    event.preventDefault();
    const currentPw = document.getElementById("currentPassword")?.value || "";
    const newPw = document.getElementById("newPassword")?.value || "";
    const confirmPw = document.getElementById("confirmNewPassword")?.value || "";
    const errorEl = document.getElementById("passwordError");

    if (errorEl) errorEl.textContent = "";

    if (hasInvalidPasswordCharacters(newPw) || hasInvalidPasswordCharacters(confirmPw)) {
        if (errorEl) errorEl.textContent = "Password may only include letters, numbers, and _ @ - # ? !.";
        return;
    }

    if (newPw.length < 8) {
        if (errorEl) errorEl.textContent = "New password must be at least 8 characters.";
        return;
    }
    if (newPw !== confirmPw) {
        if (errorEl) errorEl.textContent = "New passwords do not match.";
        return;
    }

    if (isBuiltInAdmin(currentUser)) {
        if (
            (currentUser.toLowerCase() === "admin" && currentPw !== "admin123") ||
            (currentUser.toLowerCase() === "woopiiee" && currentPw !== "Robbie")
        ) {
            if (errorEl) errorEl.textContent = "Current password is incorrect.";
            return;
        }
        if (errorEl) errorEl.textContent = "Built-in admin passwords cannot be changed here.";
        return;
    }

    const accounts = getSavedAccounts();
    const acc = accounts.find(item => item.username?.toLowerCase() === currentUser.toLowerCase());
    if (!acc) {
        if (errorEl) errorEl.textContent = "Account not found.";
        return;
    }

    try {
        const valid = await hashPassword(currentPw, acc.salt) === acc.passwordHash;
        if (!valid) {
            if (errorEl) errorEl.textContent = "Current password is incorrect.";
            return;
        }

        const salt = generatePasswordSalt();
        acc.passwordHash = await hashPassword(newPw, salt);
        acc.salt = salt;
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

        document.getElementById("passwordForm")?.reset();
        addNotification("Password Updated", "Your password has been changed successfully.");
        alert("Password updated successfully!");
    } catch (err) {
        if (errorEl) errorEl.textContent = err.message || "Could not update password.";
    }
}

function saveNotifPref() {
    const enabled = document.getElementById("notifPrefToggle")?.checked ?? true;
    localStorage.setItem("libraryNotifPref", enabled ? "on" : "off");
    addNotification("Preference Saved", enabled ? "Email notifications enabled." : "Email notifications disabled.");
}

function toggleCompactCards() {
    const compact = document.getElementById("compactCardsToggle")?.checked ?? false;
    document.body.classList.toggle("compact-cards", compact);
    localStorage.setItem("libraryCompactCards", compact ? "on" : "off");
}

function clearCartData() {
    if (!confirm("Clear your shopping cart?")) return;
    cart = [];
    saveLibraryData();
    renderAll();
    addNotification("Cart Cleared", "Your shopping cart is now empty.");
}

function clearFavoritesData() {
    if (!confirm("Clear all favorites?")) return;
    favorites = [];
    saveLibraryData();
    renderAll();
    addNotification("Favorites Cleared", "Your favorites list has been cleared.");
}

function exportLibraryData() {
    const data = {
        user: currentUser,
        books: books.length,
        cart,
        borrows: borrows.filter(b => sameUser(b.username, currentUser)),
        favorites,
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `library-export-${currentUser}-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Export Complete", "Your library data was downloaded.");
}

function resetAllLocalData() {
    if (!confirm("This will reset ALL library data (books, borrows, cart, etc.) stored in this browser. Continue?")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(AUTH_ACCOUNTS_KEY);
    localStorage.removeItem("libraryLoggedIn");
    localStorage.removeItem("libraryLoggedInUser");
    localStorage.removeItem("libraryTheme");
    localStorage.removeItem("libraryNotifPref");
    localStorage.removeItem("libraryCompactCards");
    localStorage.removeItem("libraryChats");
    localStorage.removeItem("libraryAdminLastSeen");
    localStorage.removeItem("libraryAdminChatStatus");

    alert("All local data has been reset. The page will reload.");
    location.reload();
}

function renderDeleteAccountPanel() {
    const panel = document.getElementById("deleteAccountPanel");
    if (!panel) return;

    panel.classList.toggle("hidden", !currentUser || isBuiltInAdmin(currentUser));
}

function openDeleteAccountModal() {
    if (!currentUser || isBuiltInAdmin(currentUser)) return;

    const modal = document.getElementById("deleteAccountModal");
    const errorElement = document.getElementById("deleteAccountError");

    document.getElementById("deleteAccountForm")?.reset();
    if (errorElement) errorElement.textContent = "";

    modal?.classList.remove("hidden");
    requestAnimationFrame(() => modal?.classList.add("show"));
}

function closeDeleteAccountModal() {
    const modal = document.getElementById("deleteAccountModal");

    modal?.classList.remove("show");
    setTimeout(() => modal?.classList.add("hidden"), 350);
}

function removeAccountData(username) {
    const key = String(username).toLowerCase();

    borrows.forEach(borrow => {
        if (!sameUser(borrow.username, username) || borrow.returned) return;

        const book = books.find(item => item.id === borrow.id);
        if (book) {
            book.available = Math.min(
                Number(book.copies) || 0,
                (Number(book.available) || 0) + 1
            );
        }
    });

    borrows = borrows.filter(borrow => !sameUser(borrow.username, username));

    books.forEach(book => {
        if (book.uploadedBy && sameUser(book.uploadedBy, username)) book.uploadedBy = null;
    });

    delete cartByUser[key];
    delete favoritesByUser[key];
    delete recentByUser[key];
    delete userRatings[key];
    delete userRatings[username];

    reports = reports.filter(report => !sameUser(report.reportedBy, username));

    const avatars = getAvatars();
    delete avatars[key];

    try {
        localStorage.setItem(AVATARS_KEY, JSON.stringify(avatars));
    } catch (error) {}

    loadSocial();
    delete socialData.friends[key];

    Object.keys(socialData.friends).forEach(other => {
        socialData.friends[other] = (socialData.friends[other] || []).filter(name => !sameUser(name, username));
    });

    socialData.requests = socialData.requests.filter(
        request => !sameUser(request.from, username) && !sameUser(request.to, username)
    );

    saveSocial();

    loadDMs();

    Object.keys(dmData).forEach(pair => {
        const users = dmData[pair]?.users;
        if (Array.isArray(users) && users.some(name => sameUser(name, username))) delete dmData[pair];
    });

    saveDMs();
    activeDmPeer = null;

    loadChats();
    delete chats[chatKey(username)];
    saveChats();

    const accounts = getSavedAccounts().filter(account => !sameUser(account.username, username));
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function deleteAccount(event) {
    event.preventDefault();

    const errorElement = document.getElementById("deleteAccountError");
    const fail = message => {
        if (errorElement) errorElement.textContent = message;
    };

    fail("");

    if (!currentUser || isBuiltInAdmin(currentUser)) {
        fail("Built-in administrator accounts can't be deleted.");
        return;
    }

    const password = document.getElementById("deleteAccountPassword")?.value || "";
    const confirmText = (document.getElementById("deleteAccountConfirmText")?.value || "").trim();

    if (confirmText !== "DELETE") {
        fail("Type DELETE in capital letters to confirm.");
        return;
    }

    const account = getCurrentAccount();

    if (!account) {
        fail("Account not found.");
        return;
    }

    try {
        const valid = await hashPassword(password, account.salt) === account.passwordHash;

        if (!valid) {
            fail("Password is incorrect.");
            return;
        }
    } catch (error) {
        fail(error.message || "Could not verify your password.");
        return;
    }

    if (!confirm("Permanently delete your account? This cannot be undone.")) return;

    removeAccountData(currentUser);

    endChatSession();
    currentUser = null;
    cart = [];
    favorites = [];
    recentlyViewed = [];
    saveLibraryData();
    setAuthenticated(false);

    loginForm?.reset();
    signupForm?.reset();
    showAuthForm("login");
    closeSidePanel();
    closeDeleteAccountModal();

    if (loginError) loginError.textContent = "Your account has been deleted.";
}

function enforceAccountExists() {
    if (!currentUser || isBuiltInAdmin(currentUser) || getAccountByName(currentUser)) return;

    endChatSession();
    currentUser = null;
    cart = [];
    favorites = [];
    recentlyViewed = [];
    handleLogout();

    if (loginError) loginError.textContent = "This account no longer exists.";
}

function renderAdminInventory() {
    const grid = document.getElementById("adminInventoryGrid");
    if (!grid || !isLibrarianOrAdmin(currentUser)) return;

    grid.innerHTML = books.map(book => {
        const available = Number(book.available) || 0;
        const copies = Number(book.copies) || 0;
        return `
            <div class="admin-inv-row">
                <div class="admin-inv-info">
                    <strong>${escapeHTML(book.title)}</strong>
                    <span class="muted-action">${escapeHTML(book.id)} · ${escapeHTML(book.shelf || "—")} · ${available} avail</span>
                </div>
                <div class="inventory-stepper">
                    <button class="quantity-btn" onclick="adjustCopies('${escapeHTML(book.id)}', -1)" ${copies <= 0 || available <= 0 ? "disabled" : ""}>−</button>
                    <span title="Total copies">${copies}</span>
                    <button class="quantity-btn" onclick="adjustCopies('${escapeHTML(book.id)}', 1)">+</button>
                </div>
                <button class="action-btn delete" onclick="deleteBook('${escapeHTML(book.id)}')">Del</button>
            </div>
        `;
    }).join("") || '<p class="empty">No books</p>';
}

function renderAdminPage() {
    if (!isLibrarianOrAdmin(currentUser)) return;

    const accounts = getSavedAccounts();

    document.getElementById("adminAccounts").textContent = accounts.length + 2;

    const activeLoans = borrows.filter(borrow => !borrow.returned);

    document.getElementById("adminLoans").textContent = activeLoans.length;

    document.getElementById("adminOverdue").textContent = activeLoans.filter(
        borrow => isOverdue(borrow.dueDate)
    ).length;

    const rows = [
        {
            username: "admin",
            role: "admin",
            membership: "premium",
            banned: false,
            createdAt: "Built-in",
            protected: true
        },
        {
            username: "woopiiee",
            role: "admin",
            membership: "premium",
            banned: false,
            createdAt: "Built-in",
            protected: true
        },
        ...accounts.map(account => ({
            ...account,
            role: account.role || "user",
            membership: account.membership || "regular",
            banned: !!account.banned,
            protected: false
        }))
    ];

    const table = document.getElementById("adminUsersTable");
    if (!table) return;

    table.innerHTML = rows.map(account => {
        const isCurrentUser =
            account.username.toLowerCase() === String(currentUser).toLowerCase();

        const isProtected = account.protected || isCurrentUser;

        return `
            <tr>
                <td>
                    <strong>${escapeHTML(account.username)}</strong>
                    ${isCurrentUser ? " <small>(you)</small>" : ""}
                </td>
                <td>
                    <span class="status ${account.role === "admin" ? "available" : account.role === "librarian" ? "borrowed" : "available"}">
                        ${account.role === "admin" ? "Admin" : account.role === "librarian" ? "Librarian" : "Member"}${account.authorStatus === "approved" ? " ✍️ Author" : ""}
                    </span>
                </td>
                <td>
                    <span class="status ${account.membership === "premium" ? "premium-badge" : "borrowed"}">
                        ${account.membership === "premium" ? "⭐ Premium" : "Regular"}
                    </span>
                </td>
                <td>
                    <span class="status ${account.banned ? "overdue" : "available"}">
                        ${account.banned ? "Banned" : "Active"}
                    </span>
                </td>
                <td>${escapeHTML(account.createdAt || "—")}</td>
                <td>
                    ${
                        isProtected
                            ? '<span class="muted-action">Protected</span>'
                            : `
                                <div class="admin-actions">
                                    <button
                                        class="action-btn"
                                        onclick="toggleAdminRole('${escapeHTML(account.username)}')"
                                    >
                                        ${account.role === "admin" ? "Demote Admin" : "Make Admin"}
                                    </button>
                                    <button
                                        class="action-btn"
                                        onclick="toggleLibrarianRole('${escapeHTML(account.username)}')"
                                    >
                                        ${account.role === "librarian" ? "Remove Lib" : "Make Librarian"}
                                    </button>
                                    <button
                                        class="action-btn ${account.banned ? "" : "delete"}"
                                        onclick="toggleBanUser('${escapeHTML(account.username)}')"
                                    >
                                        ${account.banned ? "Unban" : "Ban"}
                                    </button>
                                </div>
                            `
                    }
                </td>
            </tr>
        `;
    }).join("") || '<tr><td colspan="6" class="empty">No accounts yet.</td></tr>';

    renderAdminInventory();
    renderAuthorApplications();
    renderAdminAnalytics();
    renderAdminOverdue();
    renderAdminAuditTrail();
}

function renderAdminAnalytics() {
    const summary = document.getElementById("adminAnalyticsSummary");
    if (!summary) return;
    const active = borrows.filter(loan => !loan.returned);
    const overdue = active.filter(loan => isOverdue(loan.dueDate));
    const recentSince = addDays(today(), -29);
    const priorSince = addDays(today(), -59);
    const recent30 = borrows.filter(loan => loan.borrowedOn >= recentSince && loan.borrowedOn <= today()).length;
    const prior30 = borrows.filter(loan => loan.borrowedOn >= priorSince && loan.borrowedOn < recentSince).length;
    const forecast = Math.max(0, Math.round(recent30 + (recent30 - prior30) * 0.5));
    const monthlyBorrowing = new Map();
    borrows.forEach(loan => { const month = String(loan.borrowedOn || "").slice(0, 7); if (month) monthlyBorrowing.set(month, (monthlyBorrowing.get(month) || 0) + 1); });
    const busiestMonth = [...monthlyBorrowing.entries()].sort((a, b) => b[1] - a[1])[0];
    summary.innerHTML = [
        ["Borrowing history", `${borrows.length}`, "Recorded loans"],
        ["Active loans", `${active.length}`, "Currently on loan"],
        ["Overdue now", `${overdue.length}`, "Needs follow-up"],
        ["Busiest month", busiestMonth?.[0] || "—", busiestMonth ? `${busiestMonth[1]} loans` : "No loan history"],
        ["Recent demand", `${recent30}`, "Loans in the last 30 days"],
        ["Demand estimate", `${forecast}`, "Expected loans in the next 30 days"]
    ].map(([label, value, note]) => `<div class="admin-analytics-metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join("");

    const booksById = new Map(books.map(book => [String(book.id), book]));
    const counts = list => { const map = new Map(); list.forEach(loan => { const key = loan.id; const book = booksById.get(String(key)); const label = book?.title || loan.title || key; map.set(label, (map.get(label) || 0) + 1); }); return map; };
    const categories = new Map();
    borrows.forEach(loan => { const category = booksById.get(String(loan.id))?.category || "Other"; categories.set(category, (categories.get(category) || 0) + 1); });
    const weekdayCounts = new Map([["Sunday", 0], ["Monday", 0], ["Tuesday", 0], ["Wednesday", 0], ["Thursday", 0], ["Friday", 0], ["Saturday", 0]]);
    borrows.forEach(loan => { if (!loan.borrowedOn) return; const day = new Date(`${loan.borrowedOn}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }); weekdayCounts.set(day, (weekdayCounts.get(day) || 0) + 1); });
    const renderBars = (elementId, map, limit = 5) => {
        const element = document.getElementById(elementId); if (!element) return;
        const items = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
        const max = Math.max(1, ...items.map(item => item[1]));
        element.innerHTML = items.length ? items.map(([label, value]) => `<div class="admin-bar-row"><span class="admin-bar-label" title="${escapeHTML(label)}">${escapeHTML(label)}</span><div class="admin-bar-track"><div class="admin-bar-fill" style="width:${Math.max(4, value / max * 100)}%"></div></div><span class="admin-bar-value">${value}</span></div>`).join("") : '<p class="admin-chart-empty">Borrowing history will appear here.</p>';
    };
    renderBars("adminPopularBooks", counts(borrows));
    renderBars("adminPopularCategories", categories, 6);
    renderBars("adminPeakPeriods", weekdayCounts, 7);
    const forecastElement = document.getElementById("adminDemandForecast");
    if (forecastElement) forecastElement.innerHTML = `<div class="admin-forecast-value">${forecast} loans</div><p>${recent30} loans occurred in the latest 30 days; ${prior30} in the 30 days before that.</p>`;
}

function renderAdminOverdue() {
    const table = document.getElementById("adminOverdueTable");
    if (!table) return;
    const rateInput = document.getElementById("overduePenaltyRate");
    if (rateInput && document.activeElement !== rateInput) rateInput.value = String(getOverdueRate());
    const rows = borrows.filter(loan => !loan.returned && isOverdue(loan.dueDate));
    rows.forEach(loan => {
        if (!loan.overdueNoticeSent) {
            const days = getDaysLate(loan.dueDate);
            loan.overdueNoticeSent = true;
            addNotification("Overdue book reminder", `"${loan.title || loan.id}" is ${days} day(s) overdue. Estimated penalty: ${formatCurrency(days * getOverdueRate())}. Please return it.`);
        }
    });
    table.innerHTML = rows.length ? rows.map(loan => {
        const days = getDaysLate(loan.dueDate);
        return `<tr class="admin-overdue-row"><td><strong>${escapeHTML(loan.title || loan.id)}</strong><small>${escapeHTML(loan.id)}</small></td><td>${escapeHTML(loan.username || "—")}</td><td>${escapeHTML(loan.dueDate || "—")}</td><td>${days}</td><td>${formatCurrency(days * getOverdueRate())}</td><td><button type="button" class="action-btn" onclick="adminReturnBook('${escapeHTML(loan.id)}','${escapeHTML(loan.username)}')">Mark returned</button></td></tr>`;
    }).join("") : '<tr><td colspan="6" class="empty">No overdue loans right now.</td></tr>';
}

function renderAdminAuditTrail() {
    const table = document.getElementById("adminAuditTable");
    if (!table) return;
    const entries = readJSON(ADMIN_AUDIT_KEY, []);
    table.innerHTML = entries.length ? entries.slice(0, 100).map(entry => `<tr><td>${escapeHTML(entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—")}</td><td>${escapeHTML(entry.account || "—")}</td><td>${escapeHTML(entry.action || "—")}</td><td>${escapeHTML(entry.details || "—")}</td></tr>`).join("") : '<tr><td colspan="4" class="empty">Admin and transaction activity will be recorded here.</td></tr>';
}

function toggleAdminRole(username) {
    if (
        !isLibrarianOrAdmin(currentUser) ||
        isBuiltInAdmin(username) ||
        username.toLowerCase() === String(currentUser).toLowerCase()
    ) {
        return;
    }

    const accounts = getSavedAccounts();

    const account = accounts.find(
        item => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) return;

    if (account.banned) {
        alert("Unban this account before changing its role.");
        return;
    }

    account.role = account.role === "admin" ? "user" : "admin";
    recordAdminAction("Changed account role", `${username} is now ${account.role}.`);

    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    addNotification(
        "Account role updated",
        `${username} is now ${account.role === "admin" ? "an admin" : "a member"}.`
    );

    renderAll();
}

function toggleLibrarianRole(username) {
    if (
        !isLibrarianOrAdmin(currentUser) ||
        isBuiltInAdmin(username) ||
        username.toLowerCase() === String(currentUser).toLowerCase()
    ) {
        return;
    }

    const accounts = getSavedAccounts();

    const account = accounts.find(
        item => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) return;

    if (account.banned) {
        alert("Unban this account before changing its role.");
        return;
    }

    account.role = account.role === "librarian" ? "user" : "librarian";
    recordAdminAction("Changed librarian role", `${username} is now ${account.role}.`);

    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    addNotification(
        "Account role updated",
        `${username} is now ${account.role === "librarian" ? "a librarian" : "a member"}.`
    );

    renderAll();
}

function toggleBanUser(username) {
    if (
        !isLibrarianOrAdmin(currentUser) ||
        isBuiltInAdmin(username) ||
        username.toLowerCase() === String(currentUser).toLowerCase()
    ) {
        return;
    }

    const accounts = getSavedAccounts();

    const account = accounts.find(
        item => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) return;

    const action = account.banned ? "unban" : "ban";

    if (!confirm(`Are you sure you want to ${action} ${username}?`)) return;

    account.banned = !account.banned;
    recordAdminAction(account.banned ? "Banned account" : "Unbanned account", username);

    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    addNotification(
        "Account status updated",
        `${username} was ${account.banned ? "banned" : "unbanned"} by ${currentUser}.`
    );

    renderAll();
}

function adjustCopies(id, amount) {
    if (!isLibrarianOrAdmin(currentUser)) {
        alert("Admins or Librarians only.");
        return;
    }

    const book = books.find(item => item.id === id);
    if (!book) return;

    const copies = Number(book.copies) || 0;
    const available = Number(book.available) || 0;

    if (amount > 0) {
        book.copies = copies + 1;
        book.available = available + 1;
    } else {
        if (available <= 0 || copies <= 0) {
            alert("No available copy can be removed. Return borrowed books first.");
            return;
        }

        book.copies = copies - 1;
        book.available = available - 1;
    }

    recordAdminAction(amount > 0 ? "Added book copy" : "Removed book copy", `${book.title} (${book.id}); copies ${book.copies}, available ${book.available}.`);

    saveLibraryData();
    renderAll();
}

function borrowBook(id) {
    const book = books.find(item => item.id === id);
    if (!book) return;

    if (book.isPremium && !isUserPremium(currentUser)) {
        alert("This is a Premium Book. Please upgrade to Premium membership (₱99/mo) in your profile to borrow it!");
        showPage("profile");
        return;
    }

    if ((book.available || 0) <= 0) {
        alert("Unavailable");
        return;
    }

    const activeBorrows = getUserBorrows();

    if (activeBorrows.length >= 3) {
        alert("Max 3 books allowed");
        return;
    }

    if (activeBorrows.some(borrow => borrow.id === id)) {
        alert("Already borrowed");
        return;
    }

    const borrowedOn = today();
    const dueDate = addDays(borrowedOn, 14);
    const borrowFee = 10;

    borrows.push({
        id,
        title: book.title,
        username: currentUser,
        borrowedOn,
        dueDate,
        borrowFee,
        isPremium: !!book.isPremium,
        returned: false,
        returnedOn: null
    });
    recordAuditEvent("Loan started", `${book.title}; borrower ${currentUser}; due ${dueDate}; fee ${formatCurrency(borrowFee)}.`);

    sales.today += borrowFee;
    sales.month += borrowFee;

    book.available = Math.max(0, (book.available || 0) - 1);

    addNotification(
        "Book Borrowed",
        `You borrowed "${book.title}". Fee: ₱10. Due date: ${dueDate}`
    );

    saveLibraryData();
    renderAll();

    alert(`"${book.title}" borrowed!\nBorrow Fee: ₱10\nDue: ${dueDate}`);

    showPage("borrow");
}

function returnBook(id) {
    const loan = borrows.find(
        borrow => borrow.id === id &&
            sameUser(borrow.username, currentUser) &&
            !borrow.returned
    );

    if (!loan) return;

    loan.returned = true;
    loan.returnedOn = today();

    const book = books.find(item => item.id === id);

    if (book) {
        book.available = Math.min(
            Number(book.copies) || 0,
            (Number(book.available) || 0) + 1
        );
    }

    loan.overdueDays = getDaysLate(loan.dueDate);
    loan.overduePenalty = loan.overdueDays * getOverdueRate();
    loan.status = "returned";
    addNotification(
        "Book Returned",
        `You returned "${loan.title}". ${loan.overdueDays ? `It was ${loan.overdueDays} day(s) late; estimated penalty: ${formatCurrency(loan.overduePenalty)}. ` : ""}Thank you!`
    );
    recordAuditEvent("Loan returned", `${loan.title}; borrower ${loan.username}; ${loan.overdueDays} day(s) late; estimated penalty ${formatCurrency(loan.overduePenalty)}.`);

    saveLibraryData();
    renderAll();

    alert(`"${loan.title}" returned`);
}

function adminReturnBook(id, username) {
    if (!isLibrarianOrAdmin(currentUser)) return;
    const loan = borrows.find(item => item.id === id && sameUser(item.username, username) && !item.returned);
    if (!loan || !confirm(`Mark "${loan.title}" returned for ${loan.username}?`)) return;
    loan.returned = true; loan.returnedOn = today(); loan.status = "returned";
    loan.overdueDays = getDaysLate(loan.dueDate); loan.overduePenalty = loan.overdueDays * getOverdueRate();
    const book = books.find(item => item.id === id);
    if (book) book.available = Math.min(Number(book.copies) || 0, (Number(book.available) || 0) + 1);
    addNotification("Overdue loan returned", `${loan.username} returned "${loan.title}". Estimated penalty: ${formatCurrency(loan.overduePenalty)}.`);
    recordAdminAction("Recorded book return", `${loan.title}; borrower ${loan.username}; estimated penalty ${formatCurrency(loan.overduePenalty)}.`);
    saveLibraryData(); renderAll();
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id);

    if (index === -1) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }

    saveLibraryData();
    renderAll();

    const detailPanel = document.getElementById("bookDetailPanel");
    if (detailPanel && detailPanel.classList.contains("show")) {
        viewBook(id);
    }
}

function viewBook(id) {
    recentlyViewed = [
        id,
        ...recentlyViewed.filter(item => item !== id)
    ].slice(0, 12);

    saveLibraryData();

    const book = books.find(item => item.id === id);
    if (!book) return;

    const panelBody = document.getElementById("detailPanelBody");
    if (!panelBody) return;

    const isFavorite = favorites.includes(book.id);
    const myActiveIds = new Set(getUserBorrows().map(b => b.id));
    const alreadyBorrowed = myActiveIds.has(book.id);
    const available = Number(book.available) || 0;

    let borrowReturnBtn;
    if (alreadyBorrowed) {
        borrowReturnBtn = `<button class="primary-btn" style="background:linear-gradient(135deg,#059669,#047857);" onclick="returnBook('${escapeHTML(book.id)}'); closeBookDetailPanel();">Return</button>`;
    } else {
        borrowReturnBtn = `<button class="primary-btn" onclick="borrowBook('${escapeHTML(book.id)}'); closeBookDetailPanel();" ${available <= 0 ? "disabled" : ""}>Borrow</button>`;
    }

    const detailPics = [book.image, ...(Array.isArray(book.gallery) ? book.gallery : [])].filter(hasRealPicture);

    const galleryHTML = detailPics.length ? `
        <div class="detail-gallery">
            <img id="detailMainPic" class="detail-main-pic" src="${escapeHTML(detailPics[0])}" alt="${escapeHTML(book.title)}" onerror="tryNextCoverFormat(this)">
            ${detailPics.length > 1 ? `
                <div class="detail-thumbs">
                    ${detailPics.map((src, index) => `<img src="${escapeHTML(src)}" class="detail-thumb ${index === 0 ? "active" : ""}" alt="Picture ${index + 1}" onclick="swapDetailPic(this)">`).join("")}
                </div>
            ` : ""}
        </div>
    ` : "";

    panelBody.innerHTML = `
        <div class="detail-header-section">
            <div class="detail-cover-badge">
                <span style="font-size: 42px;">📖</span>
                ${book.isPremium ? '<span class="status premium-badge" style="font-size:9px; padding:2px 6px; margin-top:4px;">⭐ PREMIUM</span>' : ''}
            </div>
            <div class="detail-titles">
                <span class="card-category">${escapeHTML(book.category || "General")}</span>
                <h2>${escapeHTML(book.title)}</h2>
                <p class="card-author">By ${escapeHTML(book.author)} · ★ ${book.rating || "—"}${book.uploadedBy ? " · ✍️ Author upload" : ""}</p>
            </div>
        </div>

        ${galleryHTML}

        <div class="detail-grid">
            <div class="detail-spec">
                <span>Category</span>
                <strong>${escapeHTML(book.category || "—")}</strong>
            </div>
            <div class="detail-spec">
                <span>Publication Year</span>
                <strong>${book.year || "—"}</strong>
            </div>
            <div class="detail-spec">
                <span>Shelf Location</span>
                <strong>${escapeHTML(book.shelf || "—")}</strong>
            </div>
            <div class="detail-spec">
                <span>Condition</span>
                <strong>${escapeHTML(book.condition || "—")}</strong>
            </div>
            <div class="detail-spec">
                <span>Available Copies</span>
                <strong>${book.available}</strong>
            </div>
            <div class="detail-spec">
                <span>Price</span>
                <strong>${formatCurrency(book.price)}</strong>
            </div>
            <div class="detail-spec">
                <span>Edition</span>
                <strong>${escapeHTML(book.edition || "1st")}</strong>
            </div>
            <div class="detail-spec">
                <span>Book ID</span>
                <strong>${escapeHTML(book.id)}</strong>
            </div>
        </div>

        <div class="detail-synopsis-box">
            <h4>Full Synopsis</h4>
            <p>${escapeHTML(book.description || "No synopsis available for this book.")}</p>
        </div>

        <div class="detail-actions-footer">
            ${borrowReturnBtn}
            <button class="secondary-btn" onclick="addToCart('${escapeHTML(book.id)}')">Buy</button>
            <button class="secondary-btn fav" onclick="toggleFavorite('${escapeHTML(book.id)}')">${isFavorite ? "♥ Favorited" : "♡ Favorite"}</button>
            ${hasPurchasedBook(book.id) ? `<button class="secondary-btn rate" onclick="openRateModal('${escapeHTML(book.id)}')">Rate</button>` : ""}
        </div>
    `;

    const detailPanel = document.getElementById("bookDetailPanel");
    detailPanel?.classList.remove("hidden");
    requestAnimationFrame(() => {
        detailPanel?.classList.add("show");
    });

    if (isLibrarianOrAdmin(currentUser)) renderDashboard();
}

function closeBookDetailPanel() {
    const detailPanel = document.getElementById("bookDetailPanel");
    if (!detailPanel) return;
    detailPanel.classList.remove("show");
    setTimeout(() => {
        detailPanel.classList.add("hidden");
    }, 350);
}

function addToCart(id) {
    const book = books.find(item => item.id === id);
    if (!book) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: Number(book.price) || 0,
            quantity: 1
        });
    }

    saveLibraryData();
    addNotification("Added to Cart", `"${book.title}" was added to your cart.`);
    alert(`"${book.title}" added to cart!`);
    renderCartPage();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveLibraryData();
    renderCartPage();
}

function deleteBook(id) {
    const book = books.find(item => item.id === id);

    if (!book) return;

    const isOwner = !!book.uploadedBy && sameUser(book.uploadedBy, currentUser);

    if (!isLibrarianOrAdmin(currentUser) && !isOwner) return;

    if (borrows.some(borrow => borrow.id === id && !borrow.returned)) {
        alert("This book is currently borrowed. Wait until it is returned before deleting it.");
        return;
    }

    if (!confirm(`Delete "${book.title}"?`)) return;
    recordAdminAction("Deleted book", `${book.title} (${book.id}).`);

    books = books.filter(item => item.id !== id);
    cart = cart.filter(item => item.id !== id);
    favorites = favorites.filter(favoriteId => favoriteId !== id);

    saveLibraryData();
    renderAll();
}

function deleteBooks() {
    if (!isLibrarianOrAdmin(currentUser)) return;

    const query = prompt("Title or ID to delete:");
    if (!query) return;

    const book = books.find(
        item =>
            item.id.toLowerCase() === query.toLowerCase() ||
            item.title.toLowerCase() === query.toLowerCase()
    );

    if (!book) {
        alert("Not found");
        return;
    }

    deleteBook(book.id);
}

function checkoutCart() {
    if (!cart.length) {
        alert("Cart empty");
        return;
    }

    openCheckoutPayment();
}

function openCheckoutPayment() {
    if (!cart.length) return;
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const summary = document.getElementById("checkoutOrderSummary");
    if (summary) summary.innerHTML = `${cart.map(item => `<div class="checkout-order-line"><span>${escapeHTML(item.title)} × ${Number(item.quantity) || 1}</span><span>${formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}</span></div>`).join("")}<div class="checkout-order-line checkout-order-total"><span>Total</span><span>${formatCurrency(total)}</span></div>`;
    const modal = document.getElementById("checkoutPaymentModal");
    modal?.classList.remove("hidden"); modal?.classList.add("show");
}

function closeCheckoutPayment() {
    const modal = document.getElementById("checkoutPaymentModal");
    modal?.classList.remove("show");
    setTimeout(() => modal?.classList.add("hidden"), 250);
}

function toggleCheckoutPaymentDetails() {
    const method = document.querySelector('input[name="checkoutPaymentMethod"]:checked')?.value || "gcash";
    ["gcash", "maya", "bank"].forEach(name => document.getElementById(`checkout${name[0].toUpperCase()}${name.slice(1)}Details`)?.classList.toggle("hidden", method !== name));
    const error = document.getElementById("checkoutPaymentError");
    if (error) error.textContent = "";
}

function confirmCheckoutPayment() {
    if (!cart.length || !currentUser) return;
    const method = document.querySelector('input[name="checkoutPaymentMethod"]:checked')?.value || "gcash";
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    cart.forEach(item => {
        purchases.push({ id: item.id, title: item.title, username: currentUser, purchasedOn: today(), quantity: Number(item.quantity) || 1, amount: (Number(item.price) || 0) * (Number(item.quantity) || 1), paymentMethod: method });
    });

    sales.today += total;
    sales.month += total;
    sales.count += cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    recordAuditEvent("Purchase transaction", `${cart.length} title(s), ${formatCurrency(total)} via ${method.toUpperCase()} (demo).`);

    cart = [];

    addNotification(
        "Checkout Complete",
        `Purchased items totaling ${formatCurrency(total)}.`
    );

    saveLibraryData();
    renderAll();
    closeCheckoutPayment();
    alert(`Demo checkout complete via ${method.toUpperCase()}! Total: ${formatCurrency(total)}. No payment was processed.`);
}

function openRateModal(bookId) {
    if (!hasPurchasedBook(bookId)) {
        alert("Buy this book before rating it.");
        return;
    }

    const ratingKey = String(currentUser).toLowerCase();
    const userList = [...(userRatings[ratingKey] || []), ...(userRatings[currentUser] || [])];
    if (userList.includes(bookId)) {
        alert("You have already rated this book! You cannot rate the same book more than once.");
        return;
    }

    currentRatingBookId = bookId;
    selectedRatingStars = 5;
    const book = books.find(b => b.id === bookId);
    const titleEl = document.getElementById("rateBookTitle");
    if (titleEl && book) titleEl.textContent = book.title;
    document.getElementById("rateModal")?.classList.remove("hidden");
    document.getElementById("rateModal")?.classList.add("show");
    highlightStars(5);
}

function closeRateModal() {
    document.getElementById("rateModal")?.classList.remove("show");
    setTimeout(() => {
        document.getElementById("rateModal")?.classList.add("hidden");
    }, 350);
}

function setRatingSelection(stars) {
    selectedRatingStars = stars;
    highlightStars(stars);
}

function highlightStars(count) {
    const container = document.getElementById("starContainer");
    if (!container) return;
    const spans = container.querySelectorAll("span");
    spans.forEach((span, index) => {
        span.style.color = index < count ? "#fbbf24" : "#d1d5db";
    });
}

function submitRating() {
    if (!currentRatingBookId) return;
    if (!hasPurchasedBook(currentRatingBookId)) {
        closeRateModal();
        alert("You can rate this book after you buy it.");
        return;
    }

    const ratingKey = String(currentUser).toLowerCase();
    if (!userRatings[ratingKey]) {
        userRatings[ratingKey] = [];
    }
    userRatings[ratingKey].push(currentRatingBookId);

    const book = books.find(b => b.id === currentRatingBookId);
    if (book) {
        const isFreshAuthorBook = !book.ratingCount && !Number(book.rating);
        const currentRating = isFreshAuthorBook ? 0 : (Number(book.rating) || 4.0);
        const voteCount = isFreshAuthorBook ? 0 : (Number(book.ratingCount) || 1);
        book.rating = Number(
            ((currentRating * voteCount + selectedRatingStars) / (voteCount + 1)).toFixed(1)
        );
        book.ratingCount = voteCount + 1;
        saveLibraryData();
        renderAll();
        alert(`Thank you! You rated "${book.title}" ${selectedRatingStars} stars.`);
    }
    closeRateModal();
}

function openReportModal(targetType, targetId) {
    reportingTargetType = targetType;
    reportingTargetId = targetId;
    document.getElementById("reportReasonText").value = "";
    document.getElementById("reportModal")?.classList.remove("hidden");
    document.getElementById("reportModal")?.classList.add("show");
}

function closeReportModal() {
    document.getElementById("reportModal")?.classList.remove("show");
    setTimeout(() => {
        document.getElementById("reportModal")?.classList.add("hidden");
    }, 350);
}

function submitReport() {
    const reason = document.getElementById("reportReasonText")?.value.trim();
    if (!reason) {
        alert("Please enter a reason for reporting.");
        return;
    }
    reports.push({
        id: Date.now(),
        reportedBy: currentUser,
        targetType: reportingTargetType,
        targetId: reportingTargetId,
        reason,
        date: today()
    });
    saveLibraryData();
    addNotification("Report Submitted", `Your report regarding the ${reportingTargetType} has been sent to library admins.`);
    alert("Report successfully submitted to administrators.");
    closeReportModal();
}

function openPremiumModal() {
    document.getElementById("premiumModal")?.classList.remove("hidden");
    document.getElementById("premiumModal")?.classList.add("show");
}

function togglePremiumPaymentDetails() {
    const method = document.querySelector('input[name="premiumPaymentMethod"]:checked')?.value || "gcash";
    ["gcash", "maya", "bank"].forEach(name => document.getElementById(`premium${name[0].toUpperCase()}${name.slice(1)}Details`)?.classList.toggle("hidden", method !== name));
    const error = document.getElementById("premiumPaymentError");
    if (error) error.textContent = "";
}

function closePremiumModal() {
    document.getElementById("premiumModal")?.classList.remove("show");
    setTimeout(() => {
        document.getElementById("premiumModal")?.classList.add("hidden");
    }, 350);
}

function confirmUpgradePremium() {
    const method = document.querySelector('input[name="premiumPaymentMethod"]:checked')?.value || "gcash";
    const accounts = getSavedAccounts();
    const account = accounts.find(item => item.username?.toLowerCase() === String(currentUser).toLowerCase());

    if (account) {
        account.membership = "premium";
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
        recordAuditEvent("Premium membership activated", `${currentUser}; ₱99 via ${method.toUpperCase()} (demo transaction).`);
    }

    sales.today += 99;
    sales.month += 99;
    saveLibraryData();

    addNotification("⭐ Premium Membership Activated!", `Welcome to VIP Premium! Demo payment recorded with ${method.toUpperCase()}. No real payment was processed.`);
    alert(`Premium demo checkout complete via ${method.toUpperCase()} (₱99/mo). No real payment was processed.`);
    closePremiumModal();
    renderAll();
}

function cancelSubscription() {
    if (!confirm("Are you sure you want to cancel your Premium subscription?")) return;

    const accounts = getSavedAccounts();
    const account = accounts.find(item => item.username?.toLowerCase() === String(currentUser).toLowerCase());

    if (account) {
        account.membership = "regular";
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
        recordAuditEvent("Premium membership canceled", `${currentUser} changed to regular membership.`);
    }

    addNotification("Subscription Canceled", "Your Premium membership has been canceled. You are now a Regular member.");
    alert("Your Premium subscription has been successfully canceled.");
    renderAll();
}

const AVATARS_KEY = "libraryAvatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function getAvatars() {
    const saved = readJSON(AVATARS_KEY, {});
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function getUserAvatar() {
    if (!currentUser) return "";
    return getAvatars()[String(currentUser).toLowerCase()] || "";
}

function storeUserAvatar(value) {
    if (!currentUser) return false;
    const avatars = getAvatars();
    avatars[String(currentUser).toLowerCase()] = value;

    try {
        localStorage.setItem(AVATARS_KEY, JSON.stringify(avatars));
        return true;
    } catch {
        alert("Could not save the avatar. Browser storage is full - try a smaller image.");
        return false;
    }
}

function paintAvatar(element, value) {
    if (!element || !value) return;

    if (/^(https?:\/\/|data:image\/)/i.test(value)) {
        element.textContent = "";
        const img = document.createElement("img");
        img.src = value;
        img.alt = "Avatar";
        img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
        img.onerror = () => { element.textContent = "👤"; };
        element.appendChild(img);
    } else {
        element.textContent = value;
    }
}

function renderAvatars() {
    const value = getUserAvatar();
    const sideAvatar = document.getElementById("sideUserAvatar");

    if (!value) {
        if (sideAvatar) sideAvatar.textContent = "👤";
        return;
    }

    paintAvatar(sideAvatar, value);
    paintAvatar(document.getElementById("profileAvatar"), value);
}

function openAvatarModal() {
    const modal = document.getElementById("avatarModal");
    const urlInput = document.getElementById("customAvatarUrl");
    const fileInput = document.getElementById("customAvatarFile");

    if (urlInput) urlInput.value = "";
    if (fileInput) fileInput.value = "";

    modal?.classList.remove("hidden");
    requestAnimationFrame(() => modal?.classList.add("show"));
}

function closeAvatarModal() {
    const modal = document.getElementById("avatarModal");

    modal?.classList.remove("show");
    setTimeout(() => modal?.classList.add("hidden"), 350);
}

function applyAvatar(value) {
    if (!storeUserAvatar(value)) return;
    renderProfilePage();
    renderAvatars();
    closeAvatarModal();
}

function setAvatarChoice(emoji) {
    applyAvatar(emoji);
}

function saveCustomAvatar() {
    const fileInput = document.getElementById("customAvatarFile");
    const urlInput = document.getElementById("customAvatarUrl");
    const file = fileInput?.files?.[0];

    if (file) {
        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            alert("That image is too large. Please choose one under 2 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => applyAvatar(String(reader.result));
        reader.onerror = () => alert("Could not read that file. Please try another image.");
        reader.readAsDataURL(file);
        return;
    }

    const text = urlInput?.value.trim() || "";

    if (!text) {
        alert("Pick an emoji, paste an image URL, or upload a picture first.");
        return;
    }

    const isUrl = /^https?:\/\//i.test(text);

    if (!isUrl && Array.from(text).length > 8) {
        alert("For an emoji, enter just one or two characters. For an image, paste a full link starting with http:// or https://");
        return;
    }

    applyAvatar(text);
}

function renderAll() {
    populateCategoryFilters();
    notifyCurrentUserOverdueLoans();
    renderDashboard();
    renderBooksPage();
    renderAuthorsPage();
    renderBorrowPage();
    renderYourBooksPage();
    renderCartPage();
    renderSearchPage();
    renderProfilePage();
    renderAvatars();
    renderNotifications();

    applyRoleVisibility();
    refreshRoleBadge();
    renderThemePicker();
    renderAuthorSettingsPanel();
    renderDeleteAccountPanel();
    renderMyBooksPage();
    renderChatWidget(true);
    renderMessagesPage();

    if (isLibrarianOrAdmin(currentUser)) {
        renderAdminPage();
        renderSupportPage(true);
    }

    saveLibraryData();
}

const THEMES = {
    dark:    { label: "Simple Dark",  icon: "🌙", dark: true,  desc: "Clean default dark mode" },
    light:   { label: "Light Mode",   icon: "☀️", dark: false, desc: "Bright and simple" },
    fire:    { label: "Hellish Fire", icon: "🔥", dark: true,  desc: "Lava reds and glowing embers" },
    galaxy:  { label: "Galaxy",       icon: "🌌", dark: true,  desc: "Deep space with twinkling stars" },
    sunny:   { label: "Sunny Day",    icon: "🌞", dark: false, desc: "Blue sky and warm sunshine" },
    ocean:   { label: "Ocean Depths", icon: "🌊", dark: true,  desc: "Deep teal waves and foam" },
    forest:  { label: "Enchanted Forest", icon: "🌲", dark: true,  desc: "Moss greens and soft mist" },
    rose:    { label: "Rose Garden",  icon: "🌹", dark: false, desc: "Soft pink petals and cream" },
    cyber:   { label: "Cyber Neon",   icon: "⚡", dark: true,  desc: "Neon cyan and magenta grid" },
    midnight:{ label: "Midnight Blue",icon: "🌃", dark: true,  desc: "Cool navy and silver moonlight" },
    sakura:  { label: "Sakura Blossom", icon: "🌸", dark: false, desc: "Cherry blossom pink spring" },
    sunset: { label: "Golden Sunset", icon: "🌇", dark: true, desc: "Amber, coral and dusky purple" },
    aurora: { label: "Aurora Lights", icon: "🌠", dark: true, desc: "Green and violet northern sky" },
    coffee: { label: "Coffee House", icon: "☕", dark: true, desc: "Warm espresso and cream" },
    matrix: { label: "Matrix Code", icon: "🟩", dark: true, desc: "Black terminal with green glow" },
    gold: { label: "Royal Gold", icon: "👑", dark: true, desc: "Black and luxurious gold" },
    mint: { label: "Fresh Mint", icon: "🍃", dark: false, desc: "Cool mint and soft green" },
    peach: { label: "Peach Cream", icon: "🍑", dark: false, desc: "Warm peach and apricot" }
};

const FANCY_THEMES = ["fire", "galaxy", "sunny", "ocean", "forest", "rose", "cyber", "midnight", "sakura", "sunset", "aurora", "coffee", "matrix", "gold", "mint", "peach"];

function getSavedTheme() {
    const saved = localStorage.getItem("libraryTheme");
    return THEMES[saved] ? saved : "dark";
}

function applyTheme(name) {
    if (!THEMES[name]) name = "dark";

    document.body.dataset.theme = name;
    document.body.classList.toggle("dark-theme", THEMES[name].dark);
    document.body.classList.toggle("themed", FANCY_THEMES.includes(name));

    try {
        localStorage.setItem("libraryTheme", name);
    } catch (error) {
        console.warn("Could not save theme:", error);
    }

    renderThemePicker();
}

function renderThemePicker() {
    const picker = document.getElementById("themePicker");
    if (!picker) return;

    const current = document.body.dataset.theme || "dark";

    picker.innerHTML = Object.entries(THEMES).map(([key, theme]) => `
        <button type="button" class="theme-card ${key === current ? "active" : ""}" onclick="applyTheme('${key}')" aria-pressed="${key === current}">
            <span class="theme-swatch swatch-${key}"><span>${theme.icon}</span></span>
            <strong>${theme.label}</strong>
            <small>${theme.desc}</small>
        </button>
    `).join("");
}

function getAccountByName(username) {
    return getSavedAccounts().find(account => sameUser(account.username, username)) || null;
}

function isApprovedAuthor(username) {
    const account = getAccountByName(username);
    return !!account && account.authorStatus === "approved" && !account.banned;
}

function applyRoleVisibility() {
    const staff = isLibrarianOrAdmin(currentUser);
    const author = isApprovedAuthor(currentUser);

    document.querySelectorAll(".admin-only").forEach(element => {
        element.classList.toggle("hidden", !staff);
    });

    document.querySelectorAll(".author-only").forEach(element => {
        element.classList.toggle("hidden", !author);
    });
}

function refreshRoleBadge() {
    const badge = document.getElementById("roleBadge");
    if (!badge || !currentUser) return;

    const isPrem = isUserPremium(currentUser);
    const isAuthor = isApprovedAuthor(currentUser);

    if (isAdmin(currentUser)) {
        badge.textContent = "ADMIN";
        badge.className = "role-badge admin";
    } else if (isPrem) {
        badge.textContent = isAuthor ? "⭐ PREMIUM · ✍️ AUTHOR" : "⭐ PREMIUM";
        badge.className = "role-badge premium";
    } else if (isAuthor) {
        badge.textContent = "✍️ AUTHOR";
        badge.className = "role-badge author";
    } else {
        badge.textContent = "MEMBER";
        badge.className = "role-badge";
    }
}

function validatePenName(name, ownUsername = "") {
    const clean = String(name || "").trim();

    if (clean.length < 2 || clean.length > 40) {
        return "Pen name must be 2 to 40 characters.";
    }

    if (/\p{N}/u.test(clean)) {
        return "Pen name cannot contain numbers.";
    }

    const lower = clean.toLowerCase();
    const isOwner = value => !!ownUsername && !!value && sameUser(value, ownUsername);

    const usedByBook = books.some(
        book => String(book.author || "").toLowerCase() === lower && !isOwner(book.uploadedBy)
    );

    if (usedByBook) {
        return "That author name already exists in the library. Please choose a different pen name.";
    }

    const usedByAccount = getSavedAccounts().some(
        account => account.penName && account.penName.toLowerCase() === lower && !isOwner(account.username)
    );

    if (usedByAccount) {
        return "That pen name is already taken.";
    }

    return "";
}

function getSignupType() {
    return document.querySelector('input[name="signupType"]:checked')?.value || "regular";
}

function updateSignupType() {
    const isAuthor = getSignupType() === "author";

    document.querySelectorAll(".signup-type-option").forEach(option => {
        option.classList.toggle("active", !!option.querySelector("input")?.checked);
    });

    document.getElementById("authorSignupFields")?.classList.toggle("hidden", !isAuthor);

    const button = document.getElementById("signupSubmitBtn");
    if (button) button.textContent = isAuthor ? "Submit Author Application" : "Create Account";

    const penInput = document.getElementById("signupPenName");
    if (penInput) penInput.required = isAuthor;
}

function renderAuthorSettingsPanel() {
    const body = document.getElementById("authorSettingsBody");
    if (!body) return;

    const account = getCurrentAccount();

    if (!account) {
        body.innerHTML = "<p>Built-in administrator accounts can't apply as authors.</p>";
        return;
    }

    const status = account.authorStatus || "none";
    const pen = escapeHTML(account.penName || account.username);

    if (status === "approved") {
        body.innerHTML = `
            <p style="margin-bottom: 12px;">✅ You're an approved author as <strong>${pen}</strong>. Upload books from <strong>My Books</strong> in the menu.</p>
            <button type="button" class="secondary-btn" style="width:auto;" onclick="showPage('myBooks')">Go to My Books</button>
        `;
        return;
    }

    if (status === "pending") {
        body.innerHTML = `<p>⏳ Your author application as <strong>${pen}</strong> is waiting for an admin to review it.</p>`;
        return;
    }

    const intro = status === "rejected"
        ? '<p style="margin-bottom: 12px; color: var(--danger);">Your last application wasn\'t approved. You can update it and apply again.</p>'
        : '<p style="margin-bottom: 12px;">Want to publish your own books? Apply to become an author.</p>';

    body.innerHTML = `
        ${intro}
        <form id="authorApplyForm" onsubmit="applyAsAuthor(event)" style="max-width: 500px;">
            <label for="settingsPenName">Pen Name</label>
            <input type="text" id="settingsPenName" maxlength="40" value="${escapeHTML(account.penName || "")}" required>

            <label for="settingsAuthorBio">About You</label>
            <textarea id="settingsAuthorBio" rows="3" maxlength="300">${escapeHTML(account.authorBio || "")}</textarea>

            <p id="authorApplyError" class="error-message"></p>
            <button type="submit" class="primary-btn" style="width: 100%;">Apply as Author</button>
        </form>
    `;
}

function applyAsAuthor(event) {
    event.preventDefault();

    const current = getCurrentAccount();
    if (!current) return;

    const errorElement = document.getElementById("authorApplyError");
    const penName = (document.getElementById("settingsPenName")?.value || "").trim();
    const bio = (document.getElementById("settingsAuthorBio")?.value || "").trim();

    const problem = validatePenName(penName, current.username);
    if (problem) {
        if (errorElement) errorElement.textContent = problem;
        return;
    }

    const accounts = getSavedAccounts();
    const target = accounts.find(account => sameUser(account.username, current.username));
    if (!target) return;

    target.authorStatus = "pending";
    target.penName = penName;
    target.authorBio = bio;
    target.authorAppliedAt = today();

    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    alert("Application sent! An admin will review it soon.");
    renderAll();
}

function renderAuthorApplications() {
    const table = document.getElementById("authorApplicationsTable");
    if (!table || !isLibrarianOrAdmin(currentUser)) return;

    const order = { pending: 0, approved: 1, rejected: 2 };

    const applications = getSavedAccounts()
        .filter(account => account.authorStatus && account.authorStatus !== "none")
        .sort((a, b) => (order[a.authorStatus] ?? 3) - (order[b.authorStatus] ?? 3));

    if (!applications.length) {
        table.innerHTML = '<tr><td colspan="6" class="empty">No author applications yet.</td></tr>';
        return;
    }

    table.innerHTML = applications.map(account => {
        const status = account.authorStatus;
        const statusClass = status === "approved" ? "available" : status === "rejected" ? "overdue" : "borrowed";
        const statusLabel = status === "approved" ? "Approved" : status === "rejected" ? "Not approved" : "Pending";
        const user = escapeHTML(account.username);

        let actions;
        if (status === "approved") {
            actions = `<button class="action-btn delete" data-review-user="${user}" data-decision="rejected">Remove author</button>`;
        } else if (status === "rejected") {
            actions = `<button class="action-btn" data-review-user="${user}" data-decision="approved">Approve</button>`;
        } else {
            actions = `
                <button class="action-btn" data-review-user="${user}" data-decision="approved">Approve</button>
                <button class="action-btn delete" data-review-user="${user}" data-decision="rejected">Reject</button>
            `;
        }

        return `
            <tr>
                <td><strong>${user}</strong></td>
                <td>${escapeHTML(account.penName || "—")}</td>
                <td class="author-bio-cell">${escapeHTML(account.authorBio || "—")}</td>
                <td>${escapeHTML(account.authorAppliedAt || account.createdAt || "—")}</td>
                <td><span class="status ${statusClass}">${statusLabel}</span></td>
                <td><div class="admin-actions">${actions}</div></td>
            </tr>
        `;
    }).join("");
}

function reviewAuthorApplication(username, decision) {
    if (!isLibrarianOrAdmin(currentUser)) return;

    const accounts = getSavedAccounts();
    const account = accounts.find(item => sameUser(item.username, username));
    if (!account) return;

    if (
        decision === "rejected" &&
        account.authorStatus === "approved" &&
        !confirm(`Remove author access from ${account.username}? Their published books stay in the library.`)
    ) {
        return;
    }

    account.authorStatus = decision;
    account.authorNoticeSeen = false;

    recordAdminAction(`Author application ${decision}`, `${account.username} (${account.penName || "no pen name"}).`);

    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
    renderAll();
}

function checkAuthorNotice() {
    if (!currentUser) return;

    const accounts = getSavedAccounts();
    const account = accounts.find(item => sameUser(item.username, currentUser));

    if (!account || account.authorNoticeSeen !== false) return;

    if (account.authorStatus === "approved") {
        account.authorNoticeSeen = true;
        localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
        applyRoleVisibility();
        refreshRoleBadge();
        alert("🎉 Your author application was approved! Taking you to My Books so you can upload.");
        renderAll();
        showPage("myBooks");
        return;
    } else if (account.authorStatus === "rejected") {
        alert("Your author access was not approved. You can update your details in Settings and apply again.");
    } else {
        return;
    }

    account.authorNoticeSeen = true;
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
    renderAll();
}

function migrateUsernameData(oldName, newName) {
    books.forEach(book => {
        if (book.uploadedBy && sameUser(book.uploadedBy, oldName)) book.uploadedBy = newName;
    });

    borrows.forEach(borrow => {
        if (sameUser(borrow.username, oldName)) borrow.username = newName;
    });

    loadChats();
    const oldKey = chatKey(oldName);
    const newKey = chatKey(newName);

    if (chats[oldKey]) {
        chats[newKey] = { ...chats[oldKey], username: newName };
        delete chats[oldKey];
        saveChats();
    }

    saveLibraryData();
}

const MAX_EXTRA_PICS = 3;
let pendingCover = "";
let pendingGallery = [];

function tryNextCoverFormat(img) {
    const formats = ["png", "jpeg", "webp"];
    const src = img.getAttribute("src") || "";
    const tried = Number(img.dataset.tried || 0);

    if (/^images\//i.test(src) && tried < formats.length) {
        img.dataset.tried = tried + 1;
        img.src = src.replace(/\.[a-z0-9]+$/i, "") + "." + formats[tried];
        return;
    }

    img.parentElement?.classList.remove("has-cover");
    img.remove();
}

function hasRealPicture(src) {
    return typeof src === "string" && src.length > 4 && !/no-cover\.jpg$/i.test(src);
}

function fileToCompressedDataURL(file, maxSide = 700, quality = 0.72) {
    return new Promise((resolve, reject) => {
        if (!file.type || !file.type.startsWith("image/")) {
            reject(new Error("Please choose an image file (JPG, PNG or WEBP)."));
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            reject(new Error("That image is too large. Please choose one under 8 MB."));
            return;
        }

        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Could not read that image."));

        reader.onload = () => {
            const image = new Image();

            image.onerror = () => reject(new Error("That image could not be opened."));

            image.onload = () => {
                const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
                const width = Math.max(1, Math.round(image.width * scale));
                const height = Math.max(1, Math.round(image.height * scale));

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", quality));
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

function renderUploadPreviews() {
    const cover = document.getElementById("coverPreview");
    const gallery = document.getElementById("galleryPreview");

    if (cover) {
        cover.innerHTML = pendingCover
            ? `<div class="pic-thumb"><img src="${pendingCover}" alt="Cover preview"><button type="button" onclick="removeCoverPic()" title="Remove">×</button></div>`
            : '<span class="pic-empty">No cover picture yet</span>';
    }

    if (gallery) {
        gallery.innerHTML = pendingGallery.length
            ? pendingGallery.map((src, index) =>
                `<div class="pic-thumb"><img src="${src}" alt="Extra picture ${index + 1}"><button type="button" onclick="removeGalleryPic(${index})" title="Remove">×</button></div>`
            ).join("")
            : '<span class="pic-empty">No extra pictures</span>';
    }
}

function removeCoverPic() {
    pendingCover = "";
    renderUploadPreviews();
}

function removeGalleryPic(index) {
    pendingGallery.splice(index, 1);
    renderUploadPreviews();
}

async function handleCoverSelect(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    const errorElement = document.getElementById("bookUploadError");

    if (!file) return;
    if (errorElement) errorElement.textContent = "";

    try {
        pendingCover = await fileToCompressedDataURL(file, 640, 0.72);
    } catch (error) {
        if (errorElement) errorElement.textContent = error.message;
    }

    input.value = "";
    renderUploadPreviews();
}

async function handleGallerySelect(event) {
    const input = event.target;
    const files = Array.from(input.files || []);
    const errorElement = document.getElementById("bookUploadError");

    if (!files.length) return;
    if (errorElement) errorElement.textContent = "";

    for (const file of files) {
        if (pendingGallery.length >= MAX_EXTRA_PICS) {
            if (errorElement) errorElement.textContent = `You can add up to ${MAX_EXTRA_PICS} extra pictures.`;
            break;
        }

        try {
            pendingGallery.push(await fileToCompressedDataURL(file, 800, 0.7));
        } catch (error) {
            if (errorElement) errorElement.textContent = error.message;
        }
    }

    input.value = "";
    renderUploadPreviews();
}

function generateBookId() {
    let id;

    do {
        id = `BK-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`;
    } while (books.some(book => book.id === id));

    return id;
}

function handleBookUpload(event) {
    event.preventDefault();

    const errorElement = document.getElementById("bookUploadError");
    const fail = message => {
        if (errorElement) errorElement.textContent = message;
    };

    fail("");

    if (!isApprovedAuthor(currentUser)) {
        fail("Only approved authors can upload books.");
        return;
    }

    const account = getCurrentAccount();
    const read = id => (document.getElementById(id)?.value || "").trim();

    const title = read("uploadTitle");
    const category = read("uploadCategory");
    const price = Number(read("uploadPrice"));
    const copies = parseInt(read("uploadCopies"), 10);
    const year = parseInt(read("uploadYear"), 10) || new Date().getFullYear();
    const edition = read("uploadEdition") || "1st";
    const condition = read("uploadCondition") || "Good";
    const shelf = read("uploadShelf") || "Author Shelf";
    const description = read("uploadDescription");

    if (title.length < 2) return fail("Please enter the book title.");
    if (!category) return fail("Please enter a category.");
    if (!Number.isFinite(price) || price < 0) return fail("Please enter a valid price.");
    if (!Number.isInteger(copies) || copies < 1 || copies > 99) return fail("Copies must be between 1 and 99.");
    if (description.length < 10) return fail("Please write a synopsis (at least 10 characters).");
    if (!pendingCover) return fail("Please add a cover picture.");

    const authorName = account.penName || account.username;

    const duplicate = books.some(
        book => book.uploadedBy && sameUser(book.uploadedBy, currentUser) &&
            String(book.title).toLowerCase() === title.toLowerCase()
    );

    if (duplicate) return fail("You already published a book with that title.");

    const book = {
        id: generateBookId(),
        title,
        author: authorName,
        category,
        price,
        year,
        edition,
        copies,
        available: copies,
        shelf,
        condition,
        description,
        rating: 0,
        ratingCount: 0,
        latest: today(),
        image: pendingCover,
        gallery: [...pendingGallery],
        isPremium: false,
        uploadedBy: account.username,
        uploadedOn: today()
    };

    books.push(book);

    try {
        localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
    } catch (error) {
        books.pop();
        fail("Your browser storage is full. Try smaller pictures, remove an old book, or use fewer extra pictures.");
        return;
    }

    document.getElementById("bookUploadForm")?.reset();
    pendingCover = "";
    pendingGallery = [];
    renderUploadPreviews();

    addNotification("New Book Published", `${authorName} published "${title}".`);
    renderAll();

    alert(`"${title}" is now live in the library!`);
}

function renderMyBooksPage() {
    const list = document.getElementById("authorBooksList");
    if (!list) return;

    const datalist = document.getElementById("uploadCategoryList");

    if (datalist) {
        datalist.innerHTML = [...new Set(books.map(book => book.category).filter(Boolean))]
            .sort()
            .map(category => `<option value="${escapeHTML(category)}"></option>`)
            .join("");
    }

    const mine = books.filter(book => book.uploadedBy && sameUser(book.uploadedBy, currentUser));

    if (!mine.length) {
        list.innerHTML = '<p class="empty">You haven\'t published any books yet.</p>';
        return;
    }

    list.innerHTML = mine.map(book => {
        const pictureCount = (hasRealPicture(book.image) ? 1 : 0) + (Array.isArray(book.gallery) ? book.gallery.length : 0);

        return `
            <div class="author-book-row">
                <div class="author-book-thumb">${hasRealPicture(book.image) ? `<img src="${escapeHTML(book.image)}" alt="">` : "📖"}</div>
                <div class="author-book-info">
                    <strong>${escapeHTML(book.title)}</strong>
                    <span>${escapeHTML(book.category || "General")} · ${formatCurrency(book.price)} · ${Number(book.copies) || 0} copies · ${pictureCount} picture${pictureCount === 1 ? "" : "s"}</span>
                </div>
                <button class="action-btn" onclick="viewBook('${escapeHTML(book.id)}')">View</button>
                <button class="action-btn delete" onclick="deleteBook('${escapeHTML(book.id)}')">Delete</button>
            </div>
        `;
    }).join("");
}

function swapDetailPic(element) {
    const main = document.getElementById("detailMainPic");
    if (!main) return;

    main.src = element.src;

    document.querySelectorAll(".detail-thumb").forEach(thumb => {
        thumb.classList.toggle("active", thumb === element);
    });
}

const FRIENDS_KEY = "libraryFriends";
const DMS_KEY = "libraryDMs";

let socialData = { friends: {}, requests: [] };
let dmData = {};
let activeDmPeer = null;
let lastDmSig = "";

function loadSocial() {
    const saved = readJSON(FRIENDS_KEY, null);
    if (saved && typeof saved === "object") {
        socialData.friends = saved.friends && typeof saved.friends === "object" ? saved.friends : {};
        socialData.requests = Array.isArray(saved.requests) ? saved.requests : [];
    } else {
        socialData = { friends: {}, requests: [] };
    }
}

function saveSocial() {
    try {
        localStorage.setItem(FRIENDS_KEY, JSON.stringify(socialData));
    } catch (error) {
        console.warn("Could not save friends:", error);
    }
}

function loadDMs() {
    const saved = readJSON(DMS_KEY, {});
    dmData = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function saveDMs() {
    try {
        localStorage.setItem(DMS_KEY, JSON.stringify(dmData));
    } catch (error) {
        console.warn("Could not save DMs:", error);
    }
}

function dmPairKey(a, b) {
    return [String(a || "").toLowerCase(), String(b || "").toLowerCase()].sort().join("::");
}

function getMyFriends() {
    if (!currentUser) return [];
    const key = String(currentUser).toLowerCase();
    const list = socialData.friends[key];
    return Array.isArray(list) ? list : [];
}

function setMyFriends(list) {
    if (!currentUser) return;
    const key = String(currentUser).toLowerCase();
    socialData.friends[key] = list;
}

function areFriends(a, b) {
    const ka = String(a || "").toLowerCase();
    const kb = String(b || "").toLowerCase();
    const list = socialData.friends[ka];
    return Array.isArray(list) && list.some(name => sameUser(name, kb));
}

function sendFriendRequest() {
    const input = document.getElementById("friendUsernameInput");
    const errorElement = document.getElementById("friendRequestError");
    const targetName = (input?.value || "").trim();

    if (errorElement) errorElement.textContent = "";

    if (!currentUser) return;
    if (!targetName) {
        if (errorElement) errorElement.textContent = "Enter a username.";
        return;
    }
    if (sameUser(targetName, currentUser)) {
        if (errorElement) errorElement.textContent = "You can't add yourself.";
        return;
    }

    loadSocial();

    const accounts = getSavedAccounts();
    const builtIn = ["admin", "woopiiee"].includes(targetName.toLowerCase());
    const exists = builtIn || accounts.some(a => sameUser(a.username, targetName) && !a.banned);

    if (!exists) {
        if (errorElement) errorElement.textContent = "That username was not found.";
        return;
    }

    if (areFriends(currentUser, targetName)) {
        if (errorElement) errorElement.textContent = "You're already friends.";
        return;
    }

    const pending = socialData.requests.find(
        r => r.status === "pending" &&
            ((sameUser(r.from, currentUser) && sameUser(r.to, targetName)) ||
             (sameUser(r.from, targetName) && sameUser(r.to, currentUser)))
    );

    if (pending) {
        if (errorElement) errorElement.textContent = "A request is already pending with this user.";
        return;
    }

    const official = builtIn
        ? targetName.toLowerCase()
        : (accounts.find(a => sameUser(a.username, targetName))?.username || targetName);

    socialData.requests.push({
        id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: currentUser,
        to: official,
        status: "pending",
        createdAt: Date.now()
    });

    saveSocial();
    if (input) input.value = "";
    if (errorElement) errorElement.textContent = "";
    addNotification("Friend request sent", `Request sent to ${official}.`);
    renderMessagesPage(true);
}

function respondFriendRequest(requestId, accept) {
    loadSocial();
    const req = socialData.requests.find(r => r.id === requestId);
    if (!req || req.status !== "pending") return;
    if (!sameUser(req.to, currentUser)) return;

    req.status = accept ? "accepted" : "declined";

    if (accept) {
        const fromKey = String(req.from).toLowerCase();
        const toKey = String(req.to).toLowerCase();
        if (!Array.isArray(socialData.friends[fromKey])) socialData.friends[fromKey] = [];
        if (!Array.isArray(socialData.friends[toKey])) socialData.friends[toKey] = [];
        if (!socialData.friends[fromKey].some(n => sameUser(n, req.to))) socialData.friends[fromKey].push(req.to);
        if (!socialData.friends[toKey].some(n => sameUser(n, req.from))) socialData.friends[toKey].push(req.from);
        addNotification("New friend", `You and ${req.from} are now friends. Start chatting in Messages!`);
    }

    saveSocial();
    renderMessagesPage(true);
}

function removeFriend(username) {
    if (!currentUser || !confirm(`Remove ${username} from your friends?`)) return;
    loadSocial();
    const myKey = String(currentUser).toLowerCase();
    const theirKey = String(username).toLowerCase();
    socialData.friends[myKey] = (socialData.friends[myKey] || []).filter(n => !sameUser(n, username));
    socialData.friends[theirKey] = (socialData.friends[theirKey] || []).filter(n => !sameUser(n, currentUser));
    saveSocial();
    if (activeDmPeer && sameUser(activeDmPeer, username)) activeDmPeer = null;
    renderMessagesPage(true);
}

function getDmThread(peer, create = false) {
    if (!currentUser || !peer) return null;
    const key = dmPairKey(currentUser, peer);
    if (!dmData[key] && create) {
        dmData[key] = {
            users: [currentUser, peer],
            messages: [],
            unread: {},
            updatedAt: Date.now()
        };
    }
    return dmData[key] || null;
}

function pushDmMessage(peer, text) {
    loadDMs();
    const thread = getDmThread(peer, true);
    if (!thread) return;

    thread.messages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        from: currentUser,
        text,
        ts: Date.now()
    });
    if (thread.messages.length > 200) thread.messages = thread.messages.slice(-200);

    const peerKey = String(peer).toLowerCase();
    thread.unread[peerKey] = (thread.unread[peerKey] || 0) + 1;
    thread.updatedAt = Date.now();
    saveDMs();
}

function markDmRead(peer) {
    loadDMs();
    const thread = getDmThread(peer);
    if (!thread || !currentUser) return;
    const myKey = String(currentUser).toLowerCase();
    thread.unread[myKey] = 0;
    saveDMs();
}

function openDmThread(peer) {
    if (!areFriends(currentUser, peer) && !isLibrarianOrAdmin(currentUser)) {
        alert("You can only chat with friends. Send them a friend request first.");
        return;
    }
    activeDmPeer = peer;
    markDmRead(peer);
    renderMessagesPage(true);
    document.getElementById("dmInput")?.focus();
}

function sendDmMessage(event) {
    event.preventDefault();
    const input = document.getElementById("dmInput");
    const text = (input?.value || "").trim();
    if (!text || !activeDmPeer || !currentUser) return;
    if (!areFriends(currentUser, activeDmPeer)) {
        alert("You're no longer friends with this user.");
        return;
    }
    pushDmMessage(activeDmPeer, text);
    if (input) input.value = "";
    renderMessagesPage(true);
}

function getMyDmUnreadTotal() {
    if (!currentUser) return 0;
    loadDMs();
    const myKey = String(currentUser).toLowerCase();
    return Object.values(dmData).reduce((sum, thread) => sum + (thread.unread?.[myKey] || 0), 0);
}

function renderMessagesPage(force = false) {
    if (!currentUser) return;

    loadSocial();
    loadDMs();

    const badge = document.getElementById("messagesNavBadge");
    const pendingForMe = socialData.requests.filter(r => r.status === "pending" && sameUser(r.to, currentUser)).length;
    const unread = getMyDmUnreadTotal() + pendingForMe;
    if (badge) {
        badge.textContent = unread;
        badge.classList.toggle("hidden", unread === 0);
    }

    const requestsEl = document.getElementById("friendRequestsList");
    const friendsEl = document.getElementById("friendsList");
    const threadsEl = document.getElementById("dmThreadsList");
    if (!friendsEl || !threadsEl) return;

    const incoming = socialData.requests.filter(r => r.status === "pending" && sameUser(r.to, currentUser));
    const outgoing = socialData.requests.filter(r => r.status === "pending" && sameUser(r.from, currentUser));

    if (requestsEl) {
        let html = "";
        if (incoming.length) {
            html += `<h4 class="messages-section-title">Incoming requests</h4>` +
                incoming.map(r => `
                    <div class="friend-request-row">
                        <strong>${escapeHTML(r.from)}</strong>
                        <div>
                            <button type="button" class="action-btn" data-fr-accept="${escapeHTML(r.id)}">Accept</button>
                            <button type="button" class="action-btn delete" data-fr-decline="${escapeHTML(r.id)}">Decline</button>
                        </div>
                    </div>
                `).join("");
        }
        if (outgoing.length) {
            html += `<h4 class="messages-section-title">Sent requests</h4>` +
                outgoing.map(r => `
                    <div class="friend-request-row">
                        <span>Waiting for <strong>${escapeHTML(r.to)}</strong></span>
                    </div>
                `).join("");
        }
        requestsEl.innerHTML = html;
    }

    const friends = getMyFriends();
    friendsEl.innerHTML = friends.length
        ? friends.map(name => `
            <button type="button" class="friend-item ${activeDmPeer && sameUser(activeDmPeer, name) ? "active" : ""}" data-open-dm="${escapeHTML(name)}">
                <span>👤 ${escapeHTML(name)}</span>
                <span class="friend-actions">
                    <span class="action-btn" data-open-dm="${escapeHTML(name)}" title="Chat">💬</span>
                    <span class="action-btn delete" data-remove-friend="${escapeHTML(name)}" title="Remove">×</span>
                </span>
            </button>
        `).join("")
        : '<p class="empty" style="padding:12px;">No friends yet. Add someone by username above.</p>';

    const myKey = String(currentUser).toLowerCase();
    const threads = Object.entries(dmData)
        .filter(([, t]) => Array.isArray(t.users) && t.users.some(u => sameUser(u, currentUser)) && (t.messages || []).length)
        .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));

    threadsEl.innerHTML = threads.length
        ? threads.map(([, t]) => {
            const peer = t.users.find(u => !sameUser(u, currentUser)) || "?";
            const last = t.messages[t.messages.length - 1];
            const unreadCount = t.unread?.[myKey] || 0;
            return `
                <button type="button" class="support-item ${activeDmPeer && sameUser(activeDmPeer, peer) ? "active" : ""}" data-open-dm="${escapeHTML(peer)}">
                    <span class="support-item-top">
                        <strong>${escapeHTML(peer)}</strong>
                        ${unreadCount ? `<span class="nav-badge">${unreadCount}</span>` : ""}
                    </span>
                    <span class="support-snippet">${escapeHTML(String(last?.text || "").slice(0, 50))}</span>
                    <time>${last ? formatChatTime(last.ts) : ""}</time>
                </button>
            `;
        }).join("")
        : '<p class="empty" style="padding:12px;">No conversations yet.</p>';

    const header = document.getElementById("dmThreadHeader");
    const messagesEl = document.getElementById("dmMessages");
    const form = document.getElementById("dmForm");

    if (!activeDmPeer) {
        if (header) header.textContent = "Select a friend to start chatting";
        if (messagesEl) messagesEl.innerHTML = '<p class="empty">Pick a friend on the left to message them.</p>';
        form?.classList.add("hidden");
        return;
    }

    if (!areFriends(currentUser, activeDmPeer)) {
        activeDmPeer = null;
        renderMessagesPage(true);
        return;
    }

    markDmRead(activeDmPeer);
    const thread = getDmThread(activeDmPeer, true);

    if (header) {
        header.innerHTML = `<strong>💬 ${escapeHTML(activeDmPeer)}</strong>
            <button type="button" class="action-btn delete" data-remove-friend="${escapeHTML(activeDmPeer)}">Unfriend</button>`;
    }

    if (messagesEl) {
        messagesEl.innerHTML = (thread?.messages || []).map(msg => {
            const mine = sameUser(msg.from, currentUser);
            return `
                <div class="chat-msg ${mine ? "mine" : "theirs"}">
                    <span class="chat-msg-label">${mine ? "You" : escapeHTML(msg.from)}</span>
                    <div class="chat-bubble">${escapeHTML(msg.text).replace(/\n/g, "<br>")}</div>
                    <time>${formatChatTime(msg.ts)}</time>
                </div>
            `;
        }).join("") || '<p class="empty">Say hello! This is the start of your chat.</p>';
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    form?.classList.remove("hidden");
}

const CHAT_KEY = "libraryChats";
const ADMIN_SEEN_KEY = "libraryAdminLastSeen";
const ADMIN_PREF_KEY = "libraryAdminChatStatus";
const ADMIN_ONLINE_WINDOW_MS = 30000;
const ADMIN_HEARTBEAT_MS = 10000;
const AWAY_NOTICE_GAP_MS = 5 * 60 * 1000;

const CHAT_QUICK_OPTIONS = [
    {
        id: "return",
        label: "My return wasn't accepted",
        keywords: ["return", "returned", "giving back", "give back"],
        reply: "I'm sorry about that! Open the Borrow page and check \"My Borrowed Books\". If the book is still listed, press Return again. A successful return moves it to your History as Returned and shows a confirmation.\n\nStill stuck? Choose \"Talk to a person\" and send the Book ID so the admin can check it when they're back."
    },
    {
        id: "borrow",
        label: "I can't borrow a book",
        keywords: ["borrow", "can't borrow", "cannot borrow", "unavailable"],
        reply: "You can borrow up to 3 books at a time, for 14 days, with a ₱10 borrow fee per book.\n\nA borrow can be blocked if you already have 3 books, the book has no available copies, you already borrowed that title, or it's a Premium book and you're not a Premium member."
    },
    {
        id: "premium",
        label: "Premium membership help",
        keywords: ["premium", "vip", "subscription", "upgrade", "cancel"],
        reply: "Premium is ₱99/month and unlocks all the exclusive Premium books.\n\nTo upgrade: Profile → ✨ Upgrade to Premium.\nTo cancel: Profile → Cancel Subscription."
    },
    {
        id: "checkout",
        label: "Problem with my cart or purchase",
        keywords: ["cart", "checkout", "buy", "purchase", "payment", "pay"],
        reply: "To buy a book, tap the 🛒 button on it, review your Cart, then press Checkout. If checkout says the cart is empty, add the book again. If you were charged wrongly, choose \"Talk to a person\" and tell us what you bought."
    },
    {
        id: "report",
        label: "How do I report a book?",
        keywords: ["report", "damaged", "wrong info", "inappropriate"],
        reply: "Tap the ⚑ Report button on the book card, type the reason, then press Submit Report. The library team will look into it."
    },
    {
        id: "password",
        label: "Password or account problem",
        keywords: ["password", "login", "log in", "account", "username", "banned"],
        reply: "You can change your password in Settings → Security (you'll need your current password). You can also change your username and email in Settings.\n\nIf you're locked out or the account was banned by mistake, choose \"Talk to a person\" and include your username."
    },
    {
        id: "author",
        label: "How do I become an author?",
        keywords: ["author", "publish", "upload", "write a book"],
        reply: "Go to Settings → Author Status and press Apply as Author (new members can also pick \"Apply as Author\" when signing up). Once an admin approves you, a 📤 My Books page appears in your menu where you can upload books and pictures."
    },
    {
        id: "contact",
        label: "Contact info",
        keywords: ["contact", "phone", "email", "number", "call"],
        reply: "📞 0912 629 0432\n📧 gigachinchin@gmail.com"
    },
    {
        id: "human",
        label: "Talk to a person",
        keywords: ["admin", "human", "person", "agent", "staff", "someone"],
        flagHuman: true,
        reply: "Okay! I've flagged your chat for the admin. Please type your message below with as many details as you can (like the Book ID or what happened). They'll reply here as soon as they're back."
    }
];

const ADMIN_CANNED_REPLIES = [
    "Hi! Thanks for reaching out. How can I help?",
    "Could you send me the Book ID and what happened?",
    "All fixed! Please check again and let me know. 😊",
    "Thanks for your patience, we're looking into it."
];

let chats = {};
let chatOpen = false;
let activeSupportUser = null;
let adminHeartbeatTimer = null;
let chatRefreshTimer = null;
let lastChatSig = "";
let lastSupportSig = "";

function loadChats() {
    const saved = readJSON(CHAT_KEY, {});
    chats = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function saveChats() {
    try {
        localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
    } catch (error) {
        console.warn("Could not save chat:", error);
    }
}

function chatKey(username) {
    return String(username || "").toLowerCase();
}

function getChat(username, create = false) {
    const key = chatKey(username);

    if (!chats[key] && create) {
        chats[key] = { username, messages: [], adminUnread: 0, userUnread: 0, needsHuman: false, updatedAt: Date.now() };
    }

    return chats[key] || null;
}

function pushChatMessage(username, from, text, extra = {}) {
    loadChats();

    const chat = getChat(username, true);

    chat.messages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        from,
        text,
        ts: Date.now(),
        ...extra
    });

    if (chat.messages.length > 200) chat.messages = chat.messages.slice(-200);

    if (from === "user") chat.adminUnread = (chat.adminUnread || 0) + 1;
    if (from === "admin") chat.userUnread = (chat.userUnread || 0) + 1;
    if (from === "bot" && !(chatOpen && sameUser(currentUser, username))) {
        chat.userUnread = (chat.userUnread || 0) + 1;
    }

    chat.updatedAt = Date.now();
    saveChats();
}

function markChatRead(username, role) {
    loadChats();

    const chat = getChat(username);
    if (!chat) return;

    if (role === "user") chat.userUnread = 0;
    else chat.adminUnread = 0;

    saveChats();
}

function flagChatForAdmin(username) {
    loadChats();

    const chat = getChat(username, true);
    chat.needsHuman = true;
    chat.updatedAt = Date.now();

    saveChats();
}

function formatChatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isAdminOnline() {
    const seen = Number(localStorage.getItem(ADMIN_SEEN_KEY) || 0);
    return Date.now() - seen < ADMIN_ONLINE_WINDOW_MS;
}

function getAdminPref() {
    return localStorage.getItem(ADMIN_PREF_KEY) !== "away";
}

function beatAdmin() {
    if (currentUser && isLibrarianOrAdmin(currentUser) && getAdminPref()) {
        try {
            localStorage.setItem(ADMIN_SEEN_KEY, String(Date.now()));
        } catch (error) {}
    }
}

function startAdminHeartbeat() {
    clearInterval(adminHeartbeatTimer);
    beatAdmin();
    adminHeartbeatTimer = setInterval(beatAdmin, ADMIN_HEARTBEAT_MS);
}

function setAdminOnline(isOnline) {
    localStorage.setItem(ADMIN_PREF_KEY, isOnline ? "online" : "away");

    if (isOnline) {
        beatAdmin();
    } else {
        localStorage.setItem(ADMIN_SEEN_KEY, "0");
    }

    renderAdminStatus();
}

function renderAdminStatus() {
    const label = document.getElementById("adminStatusLabel");
    const toggle = document.getElementById("adminOnlineToggle");
    const online = getAdminPref();

    if (label) label.textContent = online ? "🟢 Online" : "⚫ Away (auto-help on)";
    if (toggle) toggle.checked = online;
}

function startChatSession() {
    loadChats();

    clearInterval(chatRefreshTimer);
    clearInterval(adminHeartbeatTimer);

    chatOpen = false;
    activeSupportUser = null;
    lastChatSig = "";
    lastSupportSig = "";

    if (isLibrarianOrAdmin(currentUser)) {
        startAdminHeartbeat();
        renderAdminStatus();
    }

    chatRefreshTimer = setInterval(refreshChatViews, 5000);
}

function endChatSession() {
    clearInterval(chatRefreshTimer);
    clearInterval(adminHeartbeatTimer);
    chatRefreshTimer = null;
    adminHeartbeatTimer = null;

    if (currentUser && isLibrarianOrAdmin(currentUser)) {
        try {
            localStorage.setItem(ADMIN_SEEN_KEY, "0");
        } catch (error) {}
    }

    chatOpen = false;
    activeSupportUser = null;

    document.getElementById("chatWidget")?.classList.add("hidden");
    document.getElementById("chatFab")?.classList.add("hidden");
}

function refreshChatViews() {
    if (!currentUser) return;

    loadChats();
    renderChatWidget();
    renderSupportPage();
}

function chatBubbleHTML(message, viewer) {
    const mine = message.from === viewer;

    let label;
    if (message.from === "bot") label = "💬 Help Center";
    else if (message.from === "admin") label = viewer === "admin" ? "You" : "🛡️ Support Team";
    else label = viewer === "user" ? "You" : "Member";

    return `
        <div class="chat-msg ${mine ? "mine" : "theirs"} from-${message.from}">
            <span class="chat-msg-label">${label}</span>
            <div class="chat-bubble">${escapeHTML(message.text).replace(/\n/g, "<br>")}</div>
            <time>${formatChatTime(message.ts)}</time>
        </div>
    `;
}

function openChatWidget() {
    chatOpen = true;
    renderChatWidget(true);
    document.getElementById("chatInput")?.focus();
}

function closeChatWidget() {
    chatOpen = false;
    renderChatWidget(true);
}

function renderChatWidget(force = false) {
    const fab = document.getElementById("chatFab");
    const widget = document.getElementById("chatWidget");
    if (!fab || !widget) return;

    const isMember = !!currentUser && !isLibrarianOrAdmin(currentUser);

    fab.classList.toggle("hidden", !isMember);

    if (!isMember) {
        widget.classList.add("hidden");
        chatOpen = false;
        return;
    }

    if (chatOpen && (getChat(currentUser)?.userUnread || 0) > 0) {
        markChatRead(currentUser, "user");
    }

    const chat = getChat(currentUser);
    const online = isAdminOnline();
    const unread = chatOpen ? 0 : (chat?.userUnread || 0);

    const fabBadge = document.getElementById("chatFabBadge");
    if (fabBadge) {
        fabBadge.textContent = unread;
        fabBadge.classList.toggle("hidden", unread === 0);
    }

    widget.classList.toggle("hidden", !chatOpen);
    fab.classList.toggle("chat-fab-open", chatOpen);

    const presence = document.getElementById("chatPresence");
    if (presence) {
        presence.textContent = online ? "🟢 Admin is online" : "🟡 Admin is away · quick help available";
        presence.className = `chat-presence ${online ? "online" : "away"}`;
    }

    if (!chatOpen) return;

    const messages = chat?.messages || [];
    const last = messages[messages.length - 1];
    const signature = JSON.stringify([messages.length, last?.id, online, currentUser]);

    if (!force && signature === lastChatSig) return;
    lastChatSig = signature;

    const greeting = online
        ? `Hi ${escapeHTML(currentUser)}! 👋 Support is online. Pick an issue type above, add a Book ID if you have one, then send your message.`
        : `Hi ${escapeHTML(currentUser)}! 👋 Support is away. Choose an issue type, use a quick help option below, or leave a ticket message and we'll reply when back.`;

    const messagesElement = document.getElementById("chatMessages");

    if (messagesElement) {
        messagesElement.innerHTML = `
            <div class="chat-msg theirs from-bot">
                <span class="chat-msg-label">💬 Help Center</span>
                <div class="chat-bubble">${greeting}</div>
            </div>
            ${messages.map(message => chatBubbleHTML(message, "user")).join("")}
        `;
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    const optionsElement = document.getElementById("chatOptions");

    if (optionsElement) {
        optionsElement.classList.toggle("hidden", online);
        optionsElement.innerHTML = online
            ? ""
            : `<span class="chat-options-title">Quick help</span>` +
              CHAT_QUICK_OPTIONS.map(option =>
                  `<button type="button" class="chat-chip" data-option="${option.id}">${escapeHTML(option.label)}</button>`
              ).join("");
    }
}

function matchQuickOption(text) {
    const lower = String(text || "").toLowerCase();

    const ordered = [...CHAT_QUICK_OPTIONS].sort((a, b) => (b.flagHuman ? 1 : 0) - (a.flagHuman ? 1 : 0));

    return ordered.find(option => option.keywords.some(keyword => lower.includes(keyword))) || null;
}

function sendUserChatMessage(text, optionId = null) {
    const clean = String(text || "").trim();

    if (!clean || !currentUser || isLibrarianOrAdmin(currentUser)) return;

    const username = currentUser;
    const issueType = document.getElementById("supportIssueType")?.value || "";
    const ref = (document.getElementById("supportRefInput")?.value || "").trim();

    const issueLabels = {
        borrow: "Borrow / Return",
        order: "Cart & Purchase",
        premium: "Premium Membership",
        account: "Account / Password",
        author: "Author / Publish",
        book: "Book Info / Report",
        other: "Other"
    };

    let payload = clean;
    if (!optionId && (issueType || ref)) {
        const parts = [];
        if (issueType) parts.push(`[${issueLabels[issueType] || issueType}]`);
        if (ref) parts.push(`Ref: ${ref}`);
        payload = `${parts.join(" ")} ${clean}`;
    }

    pushChatMessage(username, "user", payload, {
        issueType: issueType || undefined,
        ref: ref || undefined
    });

    if (!isAdminOnline()) {
        setTimeout(() => botReply(username, payload, optionId || issueType || null), 600);
    }

    renderChatWidget(true);
}

function botReply(username, text, optionId) {
    if (isAdminOnline()) return;

    const option = optionId
        ? CHAT_QUICK_OPTIONS.find(item => item.id === optionId)
        : matchQuickOption(text);

    if (option) {
        pushChatMessage(username, "bot", option.reply);
        if (option.flagHuman) flagChatForAdmin(username);
    } else {
        loadChats();
        const chat = getChat(username, true);

        if (Date.now() - (chat.lastAwayNoticeAt || 0) > AWAY_NOTICE_GAP_MS) {
            chat.lastAwayNoticeAt = Date.now();
            saveChats();
            pushChatMessage(username, "bot", "Thanks for your message! The admin is away right now, but I saved it and they'll reply when they're back. In the meantime, one of the quick options below might help.");
        }

        flagChatForAdmin(username);
    }

    if (sameUser(currentUser, username)) renderChatWidget(true);
}

function getSupportThreads() {
    return Object.values(chats)
        .filter(chat => chat && Array.isArray(chat.messages) && chat.messages.length)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function renderSupportPage(force = false) {
    if (!currentUser || !isLibrarianOrAdmin(currentUser)) return;

    const threads = getSupportThreads();
    const totalUnread = threads.reduce((sum, chat) => sum + (chat.adminUnread || 0), 0);

    const navBadge = document.getElementById("supportNavBadge");
    if (navBadge) {
        navBadge.textContent = totalUnread;
        navBadge.classList.toggle("hidden", totalUnread === 0);
    }

    const list = document.getElementById("supportList");
    if (!list) return;

    const signature = JSON.stringify([
        activeSupportUser,
        threads.map(chat => [chat.username, chat.updatedAt, chat.adminUnread, chat.needsHuman, chat.messages.length])
    ]);

    if (!force && signature === lastSupportSig) return;
    lastSupportSig = signature;

    list.innerHTML = threads.length
        ? threads.map(chat => {
            const last = chat.messages[chat.messages.length - 1];
            const active = activeSupportUser && sameUser(activeSupportUser, chat.username);

            return `
                <button type="button" class="support-item ${active ? "active" : ""}" data-support-user="${escapeHTML(chat.username)}">
                    <span class="support-item-top">
                        <strong>${escapeHTML(chat.username)}</strong>
                        ${chat.adminUnread ? `<span class="nav-badge">${chat.adminUnread}</span>` : ""}
                    </span>
                    <span class="support-snippet">${chat.needsHuman ? "🔔 " : ""}${escapeHTML(String(last.text).slice(0, 60))}</span>
                    <time>${formatChatTime(last.ts)}</time>
                </button>
            `;
        }).join("")
        : '<p class="empty">No conversations yet. When a member messages support, it appears here.</p>';

    const header = document.getElementById("supportThreadHeader");
    const messagesElement = document.getElementById("supportMessages");
    const form = document.getElementById("supportForm");
    const canned = document.getElementById("supportCanned");

    const chat = activeSupportUser ? getChat(activeSupportUser) : null;

    if (!chat) {
        if (header) header.textContent = "Select a conversation";
        if (messagesElement) messagesElement.innerHTML = '<p class="empty">Pick a member on the left to read and reply.</p>';
        form?.classList.add("hidden");
        canned?.classList.add("hidden");
        return;
    }

    if (header) {
        header.innerHTML = `
            <strong>${escapeHTML(chat.username)}</strong>
            ${chat.needsHuman ? '<span class="status borrowed">Wants a person</span>' : ""}
            <button type="button" class="action-btn delete" data-clear-chat="${escapeHTML(chat.username)}">Clear chat</button>
        `;
    }

    if (messagesElement) {
        messagesElement.innerHTML = chat.messages.map(message => chatBubbleHTML(message, "admin")).join("");
        messagesElement.scrollTop = messagesElement.scrollHeight;
    }

    form?.classList.remove("hidden");

    if (canned) {
        canned.classList.remove("hidden");
        canned.innerHTML = ADMIN_CANNED_REPLIES.map((text, index) =>
            `<button type="button" class="chat-chip" data-canned="${index}">${escapeHTML(text)}</button>`
        ).join("");
    }
}

function openSupportThread(username) {
    activeSupportUser = username;
    markChatRead(username, "admin");
    renderSupportPage(true);
    document.getElementById("supportInput")?.focus();
}

function sendAdminReply(event) {
    event.preventDefault();

    const input = document.getElementById("supportInput");
    const text = (input?.value || "").trim();

    if (!text || !activeSupportUser || !isLibrarianOrAdmin(currentUser)) return;

    pushChatMessage(activeSupportUser, "admin", text, { by: currentUser });

    loadChats();
    const chat = getChat(activeSupportUser);

    if (chat) {
        chat.needsHuman = false;
        chat.adminUnread = 0;
        saveChats();
    }

    if (input) input.value = "";
    renderSupportPage(true);
}

function clearSupportChat(username) {
    if (!isLibrarianOrAdmin(currentUser)) return;
    if (!confirm(`Delete the whole conversation with ${username}?`)) return;

    loadChats();
    delete chats[chatKey(username)];
    saveChats();

    if (activeSupportUser && sameUser(activeSupportUser, username)) activeSupportUser = null;

    renderSupportPage(true);
}

function renderAiChatMessages() {
    const container = document.getElementById("aiChatMessages");
    if (!container) return;

    container.replaceChildren();
    aiChatHistory.forEach(message => {
        const bubble = document.createElement("div");
        bubble.className = `ai-chat-message ${message.role === "user" ? "user" : "assistant"}`;

        const label = document.createElement("span");
        label.className = "ai-chat-label";
        label.textContent = message.role === "user" ? "You" : "AI Assistant";

        const content = document.createElement("p");
        content.textContent = message.content;
        bubble.append(label, content);
        if (Array.isArray(message.results)) {
            message.results.forEach(result => {
                if (!result || typeof result.title !== "string" || typeof result.url !== "string") return;
                const card = document.createElement("article");
                card.className = "ai-recommendation-card";
                const link = document.createElement("a");
                link.className = "ai-result-link";
                link.href = result.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = result.title;
                card.appendChild(link);
                if (typeof result.snippet === "string" && result.snippet) {
                    const snippet = document.createElement("p");
                    snippet.textContent = result.snippet;
                    card.appendChild(snippet);
                }
                bubble.appendChild(card);
            });
        }
        container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight;
}

async function handleAiChatSubmit(event) {
    event.preventDefault();
    if (aiAssistantBusy) return;

    const input = document.getElementById("aiChatInput");
    const status = document.getElementById("aiChatStatus");
    const button = document.getElementById("aiChatSendButton");
    const message = input?.value.trim();
    if (!message) return;

    aiAssistantBusy = true;
    if (button) button.disabled = true;
    if (input) input.disabled = true;
    if (status) status.textContent = "Searching the web with TinyFish…";

    try {
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "TinyFish search could not run.");
        const results = Array.isArray(payload.results) ? payload.results : [];

        aiChatHistory = [
            ...aiChatHistory,
            { role: "user", content: message },
            {
                role: "assistant",
                content: results.length
                    ? `TinyFish found ${results.length} web result${results.length === 1 ? "" : "s"} for your question.`
                    : "TinyFish did not find any results. Try a different search.",
                results
            }
        ].slice(-12);
        renderAiChatMessages();
        if (input) input.value = "";
        if (status) status.textContent = "";
    } catch (error) {
        if (status) status.textContent = error.message || "Could not reach the AI service. Check that the library server is running.";
    } finally {
        aiAssistantBusy = false;
        if (button) button.disabled = false;
        if (input) {
            input.disabled = false;
            input.focus();
        }
    }
}

async function handleAiRecommendationSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("aiRecommendationPrompt");
    const status = document.getElementById("aiRecommendationStatus");
    const resultsContainer = document.getElementById("aiRecommendationResults");
    const button = document.getElementById("aiRecommendationButton");
    const preference = input?.value.trim();
    if (!preference || !resultsContainer) return;

    if (button) button.disabled = true;
    if (status) status.textContent = "Searching the web for book recommendations…";
    resultsContainer.replaceChildren();

    const favoriteTitles = books.filter(book => favorites.includes(book.id)).map(book => book.title).slice(0, 5);
    const recentTitles = recentlyViewed
        .map(id => books.find(book => book.id === id)?.title)
        .filter(Boolean)
        .slice(0, 5);

    try {
        const response = await fetch("/api/ai/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                preference,
                favorites: favoriteTitles,
                recentlyViewed: recentTitles
            })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not get recommendations.");

        const recommendations = Array.isArray(payload.recommendations) ? payload.recommendations : [];
        const validRecommendations = recommendations.filter(item =>
            item && typeof item.title === "string" && typeof item.url === "string"
        ).slice(0, 8);

        if (!validRecommendations.length) {
            throw new Error("TinyFish found no book recommendations. Try describing a different topic.");
        }

        validRecommendations.forEach(result => {
            const card = document.createElement("article");
            card.className = "ai-recommendation-card";

            const title = document.createElement("h4");
            title.textContent = result.title;
            const details = document.createElement("p");
            details.className = "ai-recommendation-meta";
            details.textContent = result.site_name || "Web search result";
            const snippet = document.createElement("p");
            snippet.textContent = result.snippet || "Open this result to learn more.";
            const action = document.createElement("a");
            action.className = "secondary-btn ai-result-link";
            action.href = result.url;
            action.target = "_blank";
            action.rel = "noopener noreferrer";
            action.textContent = "Open result";
            card.append(title, details, snippet, action);
            resultsContainer.appendChild(card);
        });
        if (status) status.textContent = `Found ${validRecommendations.length} web result${validRecommendations.length === 1 ? "" : "s"}. These may not be available in the library.`;
    } catch (error) {
        if (status) status.textContent = error.message || "Could not reach the AI service. Check that the library server is running.";
    } finally {
        if (button) button.disabled = false;
    }
}

function initNewFeatureListeners() {
    document.getElementById("sideSettingsBtn")?.addEventListener("click", () => showPage("settings"));
    document.getElementById("aiChatForm")?.addEventListener("submit", handleAiChatSubmit);
    document.getElementById("aiRecommendationForm")?.addEventListener("submit", handleAiRecommendationSubmit);

    document.querySelectorAll('input[name="signupType"]').forEach(radio => {
        radio.addEventListener("change", updateSignupType);
    });
    updateSignupType();

    document.getElementById("uploadCover")?.addEventListener("change", handleCoverSelect);
    document.getElementById("uploadGallery")?.addEventListener("change", handleGallerySelect);
    document.getElementById("bookUploadForm")?.addEventListener("submit", handleBookUpload);
    renderUploadPreviews();

    document.getElementById("authorApplicationsTable")?.addEventListener("click", event => {
        const button = event.target.closest("[data-review-user]");
        if (button) reviewAuthorApplication(button.dataset.reviewUser, button.dataset.decision);
    });

    document.getElementById("chatFab")?.addEventListener("click", () => {
        if (chatOpen) closeChatWidget();
        else openChatWidget();
    });

    document.getElementById("chatClose")?.addEventListener("click", closeChatWidget);

    document.getElementById("chatForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const input = document.getElementById("chatInput");
        sendUserChatMessage(input?.value || "");
        if (input) input.value = "";
    });

    document.getElementById("chatOptions")?.addEventListener("click", event => {
        const chip = event.target.closest("[data-option]");
        if (!chip) return;

        const option = CHAT_QUICK_OPTIONS.find(item => item.id === chip.dataset.option);
        if (option) sendUserChatMessage(option.label, option.id);
    });

    document.getElementById("sendFriendRequestBtn")?.addEventListener("click", sendFriendRequest);
    document.getElementById("friendUsernameInput")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendFriendRequest();
        }
    });
    document.getElementById("dmForm")?.addEventListener("submit", sendDmMessage);

    document.getElementById("messages")?.addEventListener("click", event => {
        const accept = event.target.closest("[data-fr-accept]");
        if (accept) {
            respondFriendRequest(accept.dataset.frAccept, true);
            return;
        }
        const decline = event.target.closest("[data-fr-decline]");
        if (decline) {
            respondFriendRequest(decline.dataset.frDecline, false);
            return;
        }
        const remove = event.target.closest("[data-remove-friend]");
        if (remove) {
            event.stopPropagation();
            removeFriend(remove.dataset.removeFriend);
            return;
        }
        const openDm = event.target.closest("[data-open-dm]");
        if (openDm) openDmThread(openDm.dataset.openDm);
    });

    document.getElementById("supportList")?.addEventListener("click", event => {
        const item = event.target.closest("[data-support-user]");
        if (item) openSupportThread(item.dataset.supportUser);
    });

    document.getElementById("supportThreadHeader")?.addEventListener("click", event => {
        const button = event.target.closest("[data-clear-chat]");
        if (button) clearSupportChat(button.dataset.clearChat);
    });

    document.getElementById("supportCanned")?.addEventListener("click", event => {
        const chip = event.target.closest("[data-canned]");
        const input = document.getElementById("supportInput");

        if (chip && input) {
            input.value = ADMIN_CANNED_REPLIES[Number(chip.dataset.canned)] || "";
            input.focus();
        }
    });

    document.getElementById("supportForm")?.addEventListener("submit", sendAdminReply);

    document.getElementById("adminOnlineToggle")?.addEventListener("change", event => {
        setAdminOnline(event.target.checked);
    });

    window.addEventListener("storage", event => {
        if (
            event.key === null ||
            event.key === CHAT_KEY ||
            event.key === ADMIN_SEEN_KEY ||
            event.key === ADMIN_PREF_KEY ||
            event.key === FRIENDS_KEY ||
            event.key === DMS_KEY
        ) {
            refreshChatViews();
            renderMessagesPage();
        }

        if (event.key === null || event.key === AUTH_ACCOUNTS_KEY) {
            enforceAccountExists();
            checkAuthorNotice();
        }
    });

    window.addEventListener("pagehide", () => {
        if (currentUser && isLibrarianOrAdmin(currentUser)) {
            try {
                localStorage.setItem(ADMIN_SEEN_KEY, "0");
            } catch (error) {}
        }
    });
}

function openSidePanel() {
    document.getElementById("sidePanel")?.classList.add("open");
    document.getElementById("sideOverlay")?.classList.remove("hidden");
}

function closeSidePanel() {
    document.getElementById("sidePanel")?.classList.remove("open");
    document.getElementById("sideOverlay")?.classList.add("hidden");
}

function openHelpModal() {
    const modal = document.getElementById("helpModal");

    modal?.classList.remove("hidden");

    requestAnimationFrame(() => {
        modal?.classList.add("show");
    });
}

function closeHelpModal() {
    const modal = document.getElementById("helpModal");

    modal?.classList.remove("show");

    setTimeout(() => {
        modal?.classList.add("hidden");
    }, 350);
}

const notifBell = document.getElementById("notifBell");
const notifDropdown = document.getElementById("notifDropdown");
const markReadBtn = document.getElementById("markReadBtn");

function closeNotifDropdown() {
    if (!notifDropdown || notifDropdown.classList.contains("hidden")) return;

    notifDropdown.classList.add("hidden");
    renderNotifications();
}

notifBell?.addEventListener("click", event => {
    event.stopPropagation();
    if (!notifDropdown) return;

    if (!notifDropdown.classList.contains("hidden")) {
        closeNotifDropdown();
        return;
    }

    notifDropdown.classList.remove("hidden");

    if (notifications.some(notification => !notification.read)) {
        notifications.forEach(notification => {
            notification.read = true;
        });

        saveLibraryData();
        document.getElementById("notifBadge")?.classList.add("hidden");
    }
});

markReadBtn?.addEventListener("click", () => {
    notifications.forEach(notification => {
        notification.read = true;
    });

    saveLibraryData();
    renderNotifications();
});

document.addEventListener("click", event => {
    if (
        notifDropdown &&
        !notifDropdown.contains(event.target) &&
        notifBell &&
        !notifBell.contains(event.target)
    ) {
        closeNotifDropdown();
    }
});

navItems.forEach(button => {
    button.addEventListener("click", function () {
        showPage(this.dataset.page);
    });
});

document.getElementById("deleteBookButton")?.addEventListener("click", deleteBooks);
document.getElementById("checkoutButton")?.addEventListener("click", checkoutCart);

document.getElementById("booksSearch")?.addEventListener("input", renderBooksPage);
document.getElementById("filterAvailability")?.addEventListener("change", renderBooksPage);
document.getElementById("filterCategory")?.addEventListener("change", renderBooksPage);
document.getElementById("sortBooks")?.addEventListener("change", renderBooksPage);

document.getElementById("globalSearch")?.addEventListener("input", renderSearchPage);
document.getElementById("searchCategory")?.addEventListener("change", renderSearchPage);
document.getElementById("searchYear")?.addEventListener("change", renderSearchPage);
document.getElementById("searchAvail")?.addEventListener("change", renderSearchPage);

document.getElementById("logoutBtn")?.addEventListener("click", openSignOutModal);
document.getElementById("forgotPasswordBtn")?.addEventListener("click", openForgotPasswordModal);

document.getElementById("sidePanelToggle")?.addEventListener("click", openSidePanel);
document.getElementById("sidePanelClose")?.addEventListener("click", closeSidePanel);
document.getElementById("sideOverlay")?.addEventListener("click", closeSidePanel);

document.getElementById("logoClick")?.addEventListener("click", openHelpModal);
document.getElementById("helpClose")?.addEventListener("click", closeHelpModal);
document.getElementById("helpOverlay")?.addEventListener("click", closeHelpModal);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeHelpModal();
        closeSidePanel();
        closeRateModal();
        closeReportModal();
        closePremiumModal();
        closeDeleteAccountModal();
        closeSignOutModal();
        closeForgotPasswordModal();
        closeBookDetailPanel();
        closeNotifDropdown();
    }
});

loginForm?.addEventListener("submit", handleLogin);

document.getElementById("signupBtn")?.addEventListener("click", () => {
    showAuthForm("signup");
});

document.getElementById("backToLoginBtn")?.addEventListener("click", () => {
    showAuthForm("login");
});

signupForm?.addEventListener("submit", handleSignup);

const TECH_FAQ = [
    { q: "My return wasn't accepted", a: "Open Borrow → My Borrowed Books and press Return again. A successful return moves the book to History." },
    { q: "Why can't I borrow a book?", a: "You can hold 3 books at once. Premium books need Premium membership, and a title with no available copies can't be borrowed." },
    { q: "How do I become an author?", a: "Settings → Author Status → Apply as Author. When an admin approves you, you're taken straight to My Books." },
    { q: "How do I upgrade or cancel Premium?", a: "Profile → Upgrade to Premium (₱99/mo). To stop, use Cancel Subscription on your Profile." },
    { q: "I forgot or want to change my password", a: "Settings → Security lets you set a new password with your current one. If you're locked out, chat with support." }
];

function renderTechSupportPage() {
    const list = document.getElementById("techFaqList");
    if (!list) return;

    list.innerHTML = TECH_FAQ.map(item => `
        <details class="tech-faq-item">
            <summary>${escapeHTML(item.q)}</summary>
            <p>${escapeHTML(item.a)}</p>
        </details>
    `).join("");
}

function openSupportTopic(topic) {
    if (isLibrarianOrAdmin(currentUser)) {
        showPage("support");
        return;
    }

    openChatWidget();

    const select = document.getElementById("supportIssueType");
    if (select) select.value = topic || "";

    document.getElementById("chatInput")?.focus();
}

document.addEventListener("click", event => {
    const card = event.target.closest("[data-support-topic]");
    if (card) openSupportTopic(card.dataset.supportTopic);
});

setInterval(() => {
    if (currentUser) checkAuthorNotice();
}, 4000);

applyTheme(getSavedTheme());
initNewFeatureListeners();

if (localStorage.getItem("libraryNotifPref") === "off") {
    const t = document.getElementById("notifPrefToggle");
    if (t) t.checked = false;
}
if (localStorage.getItem("libraryCompactCards") === "on") {
    document.body.classList.add("compact-cards");
    const t = document.getElementById("compactCardsToggle");
    if (t) t.checked = true;
}

if (localStorage.getItem("libraryLoggedIn") === "true") {
    const savedUsername = localStorage.getItem("libraryLoggedInUser") || "admin";
    const savedAccount = getSavedAccounts().find(
        account => account.username?.toLowerCase() === savedUsername.toLowerCase()
    );

    if (savedAccount?.banned) {
        setAuthenticated(false);
    } else {
        setAuthenticated(true, isBuiltInAdmin(savedUsername) ? savedUsername.toLowerCase() : (savedAccount?.username || savedUsername));
        showPage(isLibrarianOrAdmin(currentUser) ? "dashboard" : "books");
        renderAll();
    }
} else {
    setAuthenticated(false);
}