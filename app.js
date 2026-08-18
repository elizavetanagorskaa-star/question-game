const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const categoriesScreen =
    document.getElementById("categories-screen");

const gameScreen =
    document.getElementById("game-screen");

const categories =
    document.getElementById("categories");

const cardsContainer =
    document.getElementById("cards-container");

const backButton =
    document.getElementById("back-button");

let questions = [];
let currentQuestions = [];
let currentIndex = 0;


// =========================
// ЗАГРУЗКА ВОПРОСОВ
// =========================

async function loadQuestions() {

    try {

        const response =
            await fetch("questions.json");

        questions =
            await response.json();

        createCategories();

    } catch (error) {

        console.error(
            "Ошибка загрузки вопросов:",
            error
        );

    }
}


// =========================
// СОЗДАНИЕ ТЕМ
// =========================

function createCategories() {

    const categoryNames =
        [...new Set(
            questions.map(
                question => question.category
            )
        )];

    categories.innerHTML = "";

    categoryNames.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-button";

        button.textContent =
            category;

        button.addEventListener(
            "click",
            () => startGame(category)
        );

        categories.appendChild(button);

    });
}


// =========================
// ПЕРЕМЕШИВАНИЕ
// =========================

function shuffle(array) {

    const copy = [...array];

    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            copy[i],
            copy[j]
        ] = [
            copy[j],
            copy[i]
        ];
    }

    return copy;
}


// =========================
// НАЧАЛО ИГРЫ
// =========================

function startGame(category) {

    currentQuestions =
        shuffle(
            questions.filter(
                question =>
                    question.category === category
            )
        );

    currentIndex = 0;

    categoriesScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );

    showCard();
}


// =========================
// ПОКАЗ КАРТОЧКИ
// =========================

function showCard() {

    cardsContainer.innerHTML = "";

    if (
        currentIndex >=
        currentQuestions.length
    ) {

        endGame();

        return;
    }

    const question =
        currentQuestions[currentIndex];

    const card =
        document.createElement("div");

    card.className =
        "question-card";

    card.textContent =
        question.question;

    cardsContainer.appendChild(card);

    addSwipe(card);
}


// =========================
// СВАЙП
// =========================

function addSwipe(card) {

    let startX = 0;
    let currentX = 0;

    let startY = 0;
    let currentY = 0;

    let dragging = false;


    card.addEventListener(
        "touchstart",
        event => {

            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;

            currentX = startX;
            currentY = startY;

            dragging = true;

            card.style.transition =
                "none";
        },
        { passive: true }
    );


    card.addEventListener(
        "touchmove",
        event => {

            if (!dragging) return;

            currentX =
                event.touches[0].clientX;

            currentY =
                event.touches[0].clientY;

            const differenceX =
                currentX - startX;

            const differenceY =
                currentY - startY;


            // Если движение больше вертикальное,
            // не двигаем карточку по горизонтали

            if (
                Math.abs(differenceY) >
                Math.abs(differenceX)
            ) {
                return;
            }


            const rotation =
                differenceX / 20;

            card.style.transform =
                `translateX(${differenceX}px)
                 rotate(${rotation}deg)`;

        },
        { passive: true }
    );


    card.addEventListener(
        "touchend",
        () => {

            if (!dragging) return;

            dragging = false;

            const differenceX =
                currentX - startX;


            card.style.transition =
                "transform 0.35s ease, opacity 0.35s ease";


            // Свайп достаточно сильный
            if (
                Math.abs(differenceX) > 100
            ) {

                const direction =
                    differenceX > 0
                        ? 1
                        : -1;


                card.style.transform =
                    `translateX(${direction * 600}px)
                     rotate(${direction * 30}deg)`;

                card.style.opacity = "0";


                setTimeout(
                    () => {

                        currentIndex++;

                        showCard();

                    },
                    250
                );


            } else {

                // Если свайп слабый —
                // возвращаем карточку

                card.style.transform =
                    "translateX(0) rotate(0)";
            }

        }
    );
}


// =========================
// КОНЕЦ ВОПРОСОВ
// =========================

function endGame() {

    cardsContainer.innerHTML = "";

    const message =
        document.createElement("div");

    message.className =
        "question-card";

    message.textContent =
        "Вопросы закончились 💕";

    cardsContainer.appendChild(
        message
    );
}


// =========================
// НАЗАД
// =========================

backButton.addEventListener(
    "click",
    () => {

        gameScreen.classList.add(
            "hidden"
        );

        categoriesScreen.classList.remove(
            "hidden"
        );

    }
);


// =========================
// ЗАПУСК
// =========================

loadQuestions();