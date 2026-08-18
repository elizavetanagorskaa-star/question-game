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

let startX = 0;
let currentX = 0;
let dragging = false;


// =====================================
// ЗАГРУЗКА ВОПРОСОВ
// =====================================

async function loadQuestions() {

    try {

        const response =
            await fetch("questions.json");

        questions =
            await response.json();

        createCategories();

    } catch (error) {

        console.error(
            "Не удалось загрузить вопросы:",
            error
        );

        categories.innerHTML = `
            <p>
                Не удалось загрузить вопросы.
                Попробуйте обновить приложение.
            </p>
        `;
    }
}


// =====================================
// СОЗДАЁМ КАТЕГОРИИ
// =====================================

function createCategories() {

    categories.innerHTML = "";

    const categoryNames = [
        "🫂 Для друзей",
        "🫶🏻 Давай сблизимся?",
        "☕️ Глубокие",
        "😸 Смешные",
        "🍷 18+"
    ];


    categoryNames.forEach(category => {

        createCategoryButton(category);

    });


    // Все темы

    createCategoryButton(
        "🦦 Все темы",
        true
    );
}


// =====================================
// КНОПКА КАТЕГОРИИ
// =====================================

function createCategoryButton(
    category,
    allTopics = false
) {

    const button =
        document.createElement("button");

    button.className =
        "category-button";

    button.textContent =
        category;

    button.addEventListener(
        "click",
        () => {

            if (allTopics) {

                startAllTopics();

            } else {

                startGame(category);

            }

        }
    );

    categories.appendChild(button);
}


// =====================================
// ПЕРЕМЕШИВАНИЕ
// =====================================

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


// =====================================
// ИГРА ПО КАТЕГОРИИ
// =====================================

function startGame(category) {

    currentQuestions =
        shuffle(
            questions.filter(
                question =>
                    question.category === category
            )
        );

    currentIndex = 0;

    openGame();

    showCards();

}


// =====================================
// ВСЕ ТЕМЫ
// =====================================

function startAllTopics() {

    currentQuestions =
        shuffle(questions);

    currentIndex = 0;

    openGame();

    showCards();
}


// =====================================
// ОТКРЫВАЕМ ЭКРАН ИГРЫ
// =====================================

function openGame() {

    categoriesScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );
}


// =====================================
// ПОКАЗЫВАЕМ ДВЕ КАРТОЧКИ
// =====================================

function showCards() {

    cardsContainer.innerHTML = "";

    if (
        currentIndex >=
        currentQuestions.length
    ) {

        endGame();

        return;
    }


    // Следующая карточка

    if (
        currentIndex + 1 <
        currentQuestions.length
    ) {

        const nextCard =
            createCard(
                currentQuestions[
                    currentIndex + 1
                ]
            );

        nextCard.classList.add(
            "next-card"
        );

        cardsContainer.appendChild(
            nextCard
        );
    }


    // Текущая карточка

    const currentCard =
        createCard(
            currentQuestions[
                currentIndex
            ]
        );

    currentCard.classList.add(
        "current-card"
    );

    cardsContainer.appendChild(
        currentCard
    );

    addSwipe(currentCard);
}


// =====================================
// СОЗДАЁМ КАРТОЧКУ
// =====================================

function createCard(question) {

    const card =
        document.createElement("div");

    card.className =
        "question-card";

    card.textContent =
        question.question;

    return card;
}


// =====================================
// СВАЙП
// =====================================

function addSwipe(card) {

    card.addEventListener(
        "touchstart",
        event => {

            startX =
                event.touches[0].clientX;

            currentX = startX;

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

            const difference =
                currentX - startX;

            const rotation =
                difference / 18;


            card.style.transform =
                `translateX(${difference}px)
                 rotate(${rotation}deg)`;


            // Небольшое увеличение следующей карточки

            const nextCard =
                document.querySelector(
                    ".next-card"
                );

            if (nextCard) {

                const progress =
                    Math.min(
                        Math.abs(difference) /
                        250,
                        1
                    );

                const scale =
                    0.94 +
                    progress * 0.06;

                const move =
                    15 -
                    progress * 15;

                nextCard.style.transform =
                    `scale(${scale})
                     translateY(${move}px)`;
            }

        },
        { passive: true }
    );


    card.addEventListener(
        "touchend",
        () => {

            if (!dragging) return;

            dragging = false;

            const difference =
                currentX - startX;


            card.style.transition =
                "transform 0.35s ease, opacity 0.35s ease";


            // =================================
            // СИЛЬНЫЙ СВАЙП
            // =================================

            if (
                Math.abs(difference) > 100
            ) {

                const direction =
                    difference > 0
                        ? 1
                        : -1;


                card.style.transform =
                    `translateX(${direction * 700}px)
                     rotate(${direction * 35}deg)`;

                card.style.opacity = "0";


                setTimeout(
                    () => {

                        currentIndex++;

                        showCards();

                    },
                    300
                );


            }

            // =================================
            // СЛАБЫЙ СВАЙП
            // =================================

            else {

                card.style.transform =
                    "translateX(0) rotate(0)";


                const nextCard =
                    document.querySelector(
                        ".next-card"
                    );

                if (nextCard) {

                    nextCard.style.transform =
                        "scale(0.94) translateY(15px)";

                }

            }

        }
    );
}


// =====================================
// КОНЕЦ ИГРЫ
// =====================================

function endGame() {

    cardsContainer.innerHTML = "";

    const message =
        document.createElement("div");

    message.className =
        "question-card";

    message.textContent =
        "Вопросы закончились 🫶🏻";

    cardsContainer.appendChild(
        message
    );
}


// =====================================
// КНОПКА НАЗАД
// =====================================

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


// =====================================
// ЗАПУСК
// =====================================

loadQuestions();